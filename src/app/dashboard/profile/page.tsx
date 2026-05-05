import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProfileRedirectPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.id || session.user._id;
  redirect(`/dashboard/profile/${userId}`);
}
