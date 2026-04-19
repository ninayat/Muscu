import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { BottomNav } from "@/components/nav/BottomNav";
import { TopBar } from "@/components/nav/TopBar";

export default async function AppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar
        username={session.user.username ?? null}
        image={session.user.image}
      />
      <main className="flex-1 max-w-xl w-full mx-auto px-4 pb-24 pt-4">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
