import { handleRedirect } from "@mikandev/next-discord-auth/redirect";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

import "@/auth";

export const GET = async (request: NextRequest) => {
  await handleRedirect(request);
  redirect("/");
};
