import { z } from "zod";

export const ActivityType = {
  Playing: 0,
  Streaming: 1,
  Listening: 2,
  Watching: 3,
  Custom: 4,
  Competing: 5,
} as const;

export const ActivityTypeEnum = z.enum(ActivityType);

export const ActivityTimestamps = z.object({
  start: z.number().int().optional(),
  end: z.number().int().optional(),
});

export const ActivityAssets = z.object({
  largeImage: z.string().optional(),
  largeText: z.string().optional(),
  smallImage: z.string().optional(),
  smallText: z.string().optional(),
});
export const Activity = z.object({
  name: z.string(),
  platform: z.enum(["desktop", "ios", "android"]).optional(),
  type: ActivityTypeEnum,
  state: z.string(),
  details: z.string().optional(),
  timestamps: ActivityTimestamps.optional(),
  assets: ActivityAssets.optional(),
});

const scope = "sdk.social_layer";
const Token = z
  .object({
    token_type: z.literal("Bearer"),
    access_token: z.string(),
    expires_in: z.number(),
    refresh_token: z.string(),
    scope: z.literal(scope),
  })
  .transform(caseConvertDecode);
const UpdatedActivity = z.object({
  token: z.string(),
  activities: z.array(z.any()),
});

// biome-ignore lint/suspicious/noExplicitAny: required
function caseConvertDecode(obj: Record<string, any>): Record<string, any> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      const newKey = key.replace(/_([a-z])/g, (_, letter) =>
        letter.toUpperCase(),
      );
      if (value && typeof value === "object" && !Array.isArray(value)) {
        value = caseConvertDecode(value);
      } else if (Array.isArray(value)) {
        value = value.map((item) =>
          item && typeof item === "object" ? caseConvertDecode(item) : item,
        );
      }
      return [newKey, value];
    }),
  );
}

// biome-ignore lint/suspicious/noExplicitAny: required
function caseConvertEncode(obj: Record<string, any>): Record<string, any> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      const newKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
      if (value && typeof value === "object" && !Array.isArray(value)) {
        value = caseConvertEncode(value);
      } else if (Array.isArray(value)) {
        value = value.map((item) =>
          item && typeof item === "object" ? caseConvertEncode(item) : item,
        );
      }
      return [newKey, value];
    }),
  );
}

export class ActivityManager {
  private clientId: string;
  private clientSecret: string;
  private callback: string;

  constructor(clientId: string, clientSecret: string, callback: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.callback = callback;
  }
  getLink() {
    return `https://discord.com/oauth2/authorize?client_id=${this.clientId}&response_type=code&redirect_uri=${encodeURIComponent(this.callback)}&scope=${encodeURIComponent(scope)}`;
  }
  getDashboardLink() {
    return `https://discord.com/developers/applications/${this.clientId}/oauth2`;
  }
  async fetchToken(code: string) {
    const body = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: "authorization_code",
      code: code,
      redirect_uri: this.callback,
    });

    const response = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Token exchange failed: ${response.statusText}\n${text}`);
    }
    const data = await response.json();
    return Token.parse(data);
  }
  async update(
    oauthToken: string,
    activities: z.infer<typeof Activity>[],
    token?: string,
  ) {
    const response = await fetch(
      "https://discord.com/api/v10/users/@me/headless-sessions",
      {
        body: JSON.stringify({
          activities: activities.map((activity) =>
            caseConvertEncode({
              ...activity,
              applicationId: this.clientId,
            }),
          ),
          token,
        }),
        method: "POST",
        headers: {
          Authorization: `Bearer ${oauthToken}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Activity update failed: ${response.statusText}\n${text}`,
      );
    }
    const data = await response.json();
    return UpdatedActivity.parse(data);
  }
  async me(oauthToken: string) {
    const response = await fetch("https://discord.com/api/v10/users/@me", {
      headers: {
        Authorization: `Bearer ${oauthToken}`,
      },
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Fetch user info failed: ${response.statusText}\n${text}`,
      );
    }
    return await response.json();
  }
}
