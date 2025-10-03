import { PrismaClient } from "@/generated/prisma/edge";
import { ActivityManager } from "@/actions/activityManager";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Check authorization
    const authHeader = request.headers.get("authorization");
    const expectedAuth = `Bearer ${process.env.API_PASSWORD}`;

    if (!authHeader || authHeader !== expectedAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const activityManager = new ActivityManager(
      process.env.DISCORD_CLIENT_ID as string,
      process.env.DISCORD_CLIENT_SECRET as string,
      process.env.DISCORD_REDIRECT_URI as string,
    );

    // Get all users with presence enabled
    const users = await prisma.user.findMany({
      where: { enabled: true },
    });

    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ userId: string; error: string }>,
    };

    for (const user of users) {
      try {
        // Refresh the token
        let accessToken = user.token;
        try {
          const tokenResponse = await fetch(
            "https://discord.com/api/v10/oauth2/token",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                client_id: process.env.DISCORD_CLIENT_ID as string,
                client_secret: process.env.DISCORD_CLIENT_SECRET as string,
                grant_type: "refresh_token",
                refresh_token: user.refreshToken,
              }),
            },
          );

          if (tokenResponse.ok) {
            const tokenData = await tokenResponse.json();
            accessToken = tokenData.access_token;

            // Update token in database
            await prisma.user.update({
              where: { id: user.id },
              data: {
                token: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
              },
            });
          } else {
            console.error(`Failed to refresh token for user ${user.id}`);
            results.failed++;
            results.errors.push({
              userId: user.id,
              error: "Failed to refresh token",
            });
            continue;
          }
        } catch (error) {
          console.error(`Token refresh error for user ${user.id}:`, error);
          results.failed++;
          results.errors.push({
            userId: user.id,
            error: "Token refresh exception",
          });
          continue;
        }

        // Build activity object
        if (!user.name) {
          results.failed++;
          results.errors.push({
            userId: user.id,
            error: "No activity name configured",
          });
          continue;
        }

        const activity: any = {
          name: user.name,
          type: user.type ? getActivityTypeValue(user.type) : 0,
          state: user.state || undefined,
          details: user.details || undefined,
        };

        if (user.platform) {
          activity.platform = user.platform;
        }

        if (user.largeImage || user.smallImage) {
          activity.assets = {};
          if (user.largeImage) activity.assets.largeImage = user.largeImage;
          if (user.smallImage) activity.assets.smallImage = user.smallImage;
          if (user.smallText) activity.assets.smallText = user.smallText;
        }

        // Update Discord presence
        try {
          const result = await activityManager.update(
            accessToken,
            [activity],
            user.sessionToken || undefined,
          );

          // Persist the session token if it's new or different
          if (result.token && result.token !== user.sessionToken) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                sessionToken: result.token,
              },
            });
          }

          results.success++;
        } catch (error) {
          console.error(
            `Failed to update presence for user ${user.id}:`,
            error,
          );
          results.failed++;
          results.errors.push({
            userId: user.id,
            error: "Failed to update presence",
          });
        }
      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error);
        results.failed++;
        results.errors.push({
          userId: user.id,
          error: "Unexpected error",
        });
      }
    }

    return NextResponse.json({
      message: "Batch update completed",
      results,
    });
  } catch (error) {
    console.error("Batch update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

function getActivityTypeValue(type: string): number {
  const types: Record<string, number> = {
    Playing: 0,
    Streaming: 1,
    Listening: 2,
    Watching: 3,
    Custom: 4,
    Competing: 5,
  };
  return types[type] ?? 0;
}
