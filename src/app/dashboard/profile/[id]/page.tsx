import { getUserProfile } from "@/actions/actions";
import ProfileClient from "./ProfileClient";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }
  const { id } = await params;

  const { success, user, error } = await getUserProfile(id);

  if (!success || !user) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">User Not Found</h2>
          <p className="text-slate-500">{"The user you are looking for does not exist."}</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = session.user.id === user._id.toString() || session.user._id === user._id.toString();
  const isAdmin = session.user.role === "admin";

  return (
    <ProfileClient
      user={user}
      isOwnProfile={isOwnProfile}
      isAdmin={isAdmin}
    />
  );
}
