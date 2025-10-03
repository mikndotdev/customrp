import { FaDiscord } from "react-icons/fa";
import { signIn } from "@mikandev/next-discord-auth/server-actions";

import "@/auth";

export default function Unauthorized() {
  return (
    <main className="flex h-screen items-center justify-center flex-col">
      <div className="flex flex-row items-center justify-center gap-4">
        <FaDiscord className="text-[#5865F2]" size={40} />
        <h1 className="text-2xl font-bold">Please log in.</h1>
      </div>
      <form
        action={async () => {
          "use server";
          await signIn();
        }}
      >
        <button className={"btn btn-primary mt-4"} type="submit">
          Login with Discord
        </button>
      </form>
    </main>
  );
}
