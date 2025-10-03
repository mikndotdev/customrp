import { PrismaClient } from "@/generated/prisma/edge";
import { type Session } from "@mikandev/next-discord-auth";

const prisma = new PrismaClient();

export async function getUser(session: Session) {
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    const newUser = await prisma.user.create({
      data: {
        id: session.user.id,
        token: session.accessToken || "",
        refreshToken: session.refreshToken || "",
      },
    });
    return newUser;
  }

  // Update tokens and return the updated user
  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      token: session.accessToken || "",
      refreshToken: session.refreshToken || "",
    },
  });

  return updatedUser;
}
