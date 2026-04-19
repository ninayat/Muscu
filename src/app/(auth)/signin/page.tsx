import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SignInForm } from "./SignInForm";

export const metadata = { title: "Sign in — IronFeed" };

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) redirect("/feed");

  const hasGoogle = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );
  const hasEmail = Boolean(process.env.EMAIL_SERVER && process.env.EMAIL_FROM);

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="card w-full max-w-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-push flex items-center justify-center text-white font-black">
            IF
          </div>
          <div>
            <h1 className="text-xl font-bold">IronFeed</h1>
            <p className="text-xs text-black/60 dark:text-white/60">
              Log. Share. Get stronger.
            </p>
          </div>
        </div>
        <SignInForm hasGoogle={hasGoogle} hasEmail={hasEmail} />
      </div>
    </main>
  );
}
