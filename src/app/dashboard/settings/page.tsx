import { getSession } from "@mikandev/next-discord-auth/server-actions";
import "@/auth";
import { unauthorized } from "next/navigation";
import { getUser } from "@/data/user";
import SettingsForm from "./SettingsForm";
import { logout } from "@/actions/auth";

export default async function SettingsPage() {
  const session = await getSession();

  if (!session) {
    unauthorized();
  }

  const user = await getUser(session);

  // Construct Discord avatar URL
  const avatarUrl = session.user.avatar
    ? session.user.avatar
    : `https://cdn.discordapp.com/embed/avatars/0.png`;

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* User Profile Card */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center gap-4">
              <div className="avatar">
                <div className="w-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img src={avatarUrl} alt={session.user.name} />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{session.user.name}</h2>
                <p className="text-sm opacity-70">ID: {session.user.id}</p>
              </div>
            </div>
            <form action={logout} className="mt-4">
              <button type="submit" className="btn btn-error btn-sm w-full">
                Logout
              </button>
            </form>
          </div>
        </div>

        {/* Settings Card */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Rich Presence Settings</h2>
            <SettingsForm user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}
