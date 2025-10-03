"use server";

import { PrismaClient, ActivityType } from "@/generated/prisma/edge";
import { getSession } from "@mikandev/next-discord-auth/server-actions";
import { revalidatePath } from "next/cache";
import { ActivityManager } from "./activityManager";
import { z } from "zod";

const prisma = new PrismaClient();

const SettingsSchema = z.object({
  enabled: z.boolean(),
  name: z.string().min(1, "Name is required"),
  platform: z.enum(["desktop", "ios", "android"]).optional(),
  type: z.number(),
  details: z.string().optional(),
  state: z.string().optional(),
  largeImage: z.string().optional(),
  smallImage: z.string().optional(),
  smallText: z.string().optional(),
  btn1Text: z.string().optional(),
  btn1Url: z.string().url().optional().or(z.literal("")),
  btn2Text: z.string().optional(),
  btn2Url: z.string().url().optional().or(z.literal("")),
});

async function deleteHeadlessSession(
  accessToken: string,
  sessionToken?: string,
) {
  try {
    const body: any = {};
    if (sessionToken) {
      body.token = sessionToken;
    }

    const response = await fetch(
      "https://discord.com/api/v10/users/@me/headless-sessions/delete",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      const text = await response.text();
      console.error(
        `Failed to delete headless session: ${response.statusText}\n${text}`,
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error deleting headless session:", error);
    return false;
  }
}

export async function saveSettings(formData: FormData) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    // Parse form data
    const platformValue = formData.get("platform") as string;
    const data = {
      enabled: formData.get("enabled") === "on",
      name: formData.get("name") as string,
      platform:
        platformValue && platformValue !== "" ? platformValue : undefined,
      type: Number.parseInt(formData.get("type") as string),
      details: (formData.get("details") as string) || undefined,
      state: (formData.get("state") as string) || undefined,
      largeImage: (formData.get("largeImage") as string) || undefined,
      smallImage: (formData.get("smallImage") as string) || undefined,
      smallText: (formData.get("smallText") as string) || undefined,
      btn1Text: (formData.get("btn1Text") as string) || undefined,
      btn1Url: (formData.get("btn1Url") as string) || undefined,
      btn2Text: (formData.get("btn2Text") as string) || undefined,
      btn2Url: (formData.get("btn2Url") as string) || undefined,
    };

    // Validate
    const validated = SettingsSchema.parse(data);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Map activity type number to string
    const activityTypeMap: Record<number, ActivityType> = {
      0: ActivityType.Playing,
      1: ActivityType.Streaming,
      2: ActivityType.Listening,
      3: ActivityType.Watching,
      4: ActivityType.Custom,
      5: ActivityType.Competing,
    };

    const activityTypeKey =
      activityTypeMap[validated.type] || ActivityType.Playing;

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        enabled: validated.enabled,
        name: validated.name,
        platform: validated.platform,
        type: activityTypeKey,
        details: validated.details,
        state: validated.state,
        largeImage: validated.largeImage,
        smallImage: validated.smallImage,
        smallText: validated.smallText,
        btn1Text: validated.btn1Text,
        btn1Url: validated.btn1Url || null,
        btn2Text: validated.btn2Text,
        btn2Url: validated.btn2Url || null,
      },
    });

    const activityManager = new ActivityManager(
      process.env.DISCORD_CLIENT_ID as string,
      process.env.DISCORD_CLIENT_SECRET as string,
      process.env.DISCORD_REDIRECT_URI as string,
    );

    // Update Discord presence if enabled, or delete session if disabled
    if (validated.enabled) {
      const activity: any = {
        name: validated.name,
        type: validated.type,
        state: validated.state,
        details: validated.details,
      };

      if (validated.platform) {
        activity.platform = validated.platform;
      }

      if (validated.largeImage || validated.smallImage) {
        activity.assets = {};
        if (validated.largeImage)
          activity.assets.largeImage = validated.largeImage;
        if (validated.smallImage)
          activity.assets.smallImage = validated.smallImage;
        if (validated.smallText)
          activity.assets.smallText = validated.smallText;
      }

      // Add buttons if provided
      const buttons = [];
      if (validated.btn1Text && validated.btn1Url) {
        buttons.push({ label: validated.btn1Text, url: validated.btn1Url });
      }
      if (validated.btn2Text && validated.btn2Url) {
        buttons.push({ label: validated.btn2Text, url: validated.btn2Url });
      }
      if (buttons.length > 0) {
        activity.buttons = buttons;
      }

      try {
        // Pass the existing session token if available
        const result = await activityManager.update(
          user.token,
          [activity],
          user.sessionToken || undefined,
        );

        // Persist the session token if it's new or different
        if (result.token && result.token !== user.sessionToken) {
          await prisma.user.update({
            where: { id: session.user.id },
            data: {
              sessionToken: result.token,
            },
          });
        }
      } catch (error) {
        console.error("Failed to update Discord presence:", error);
        return {
          success: false,
          error:
            "Failed to update Discord presence. Your settings were saved but the presence update failed.",
        };
      }
    } else {
      // Delete the headless session when disabling, passing the session token
      await deleteHeadlessSession(user.token, user.sessionToken || undefined);

      // Clear the session token from the database
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          sessionToken: null,
        },
      });
    }

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    console.error("Error saving settings:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Failed to save settings" };
  }
}
