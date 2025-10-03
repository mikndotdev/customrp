import { setup } from "@mikandev/next-discord-auth";

await setup({
  clientId: process.env.DISCORD_CLIENT_ID as string,
  clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
  redirectUri: process.env.DISCORD_REDIRECT_URI as string,
  scopes: ["identify", "sdk.social_layer"],
  jwtSecret: process.env.JWT_SECRET as string,
});
