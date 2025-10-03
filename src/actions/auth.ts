"use server";

import { signOut as discordSignOut } from "@mikandev/next-discord-auth/server-actions";
import { redirect } from "next/navigation";

export async function logout() {
  await discordSignOut();
  redirect("/");
}
