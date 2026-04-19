"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

type DevUser = {
  email: string;
  name: string | null;
  username: string;
  image: string | null;
};

export function SignInForm({
  hasGoogle,
  hasEmail,
  hasDevAuth,
  devUsers
}: {
  hasGoogle: boolean;
  hasEmail: boolean;
  hasDevAuth: boolean;
  devUsers: DevUser[];
}) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <div className="space-y-4">
      {hasGoogle && (
        <button
          className="btn w-full bg-white text-ink-900 border border-black/10 hover:bg-black/5"
          onClick={() => signIn("google", { callbackUrl: "/feed" })}
        >
          Continue with Google
        </button>
      )}

      {hasEmail && (
        <form
          className="space-y-2"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            await signIn("email", { email, callbackUrl: "/feed" });
            setSent(true);
            setBusy(false);
          }}
        >
          <input
            type="email"
            required
            placeholder="you@example.com"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="btn-primary w-full" disabled={busy}>
            {busy ? "Sending…" : "Email me a magic link"}
          </button>
          {sent && (
            <p className="text-xs text-pull">
              Check your inbox for the sign-in link.
            </p>
          )}
        </form>
      )}

      {hasDevAuth && devUsers.length > 0 && (
        <div className="space-y-2">
          {(hasGoogle || hasEmail) && (
            <div className="flex items-center gap-2 text-[11px] uppercase opacity-50">
              <span className="flex-1 h-px bg-current opacity-30" />
              dev mode
              <span className="flex-1 h-px bg-current opacity-30" />
            </div>
          )}
          <p className="text-xs opacity-60">
            One-click sign in as a seed user (dev only):
          </p>
          <div className="space-y-2">
            {devUsers.map((u) => (
              <button
                key={u.email}
                onClick={() =>
                  signIn("dev", { email: u.email, callbackUrl: "/feed" })
                }
                className="w-full flex items-center gap-3 rounded-xl border border-black/10 dark:border-white/10 px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10 transition"
              >
                {u.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={u.image}
                    alt=""
                    className="w-8 h-8 rounded-full bg-white"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-push/20" />
                )}
                <div className="text-left flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">
                    {u.name ?? u.username}
                  </div>
                  <div className="text-[11px] opacity-60 truncate">
                    @{u.username}
                  </div>
                </div>
                <span className="text-xs opacity-50">→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!hasGoogle && !hasEmail && !hasDevAuth && (
        <p className="text-sm text-black/60 dark:text-white/60">
          No auth provider is configured. Set <code>GOOGLE_CLIENT_ID</code> /{" "}
          <code>EMAIL_SERVER</code> in <code>.env</code> to enable sign-in.
        </p>
      )}
    </div>
  );
}
