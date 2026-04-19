"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export function SignInForm({
  hasGoogle,
  hasEmail
}: {
  hasGoogle: boolean;
  hasEmail: boolean;
}) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <div className="space-y-3">
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

      {!hasGoogle && !hasEmail && (
        <p className="text-sm text-black/60 dark:text-white/60">
          No auth provider is configured. Set <code>GOOGLE_CLIENT_ID</code> /{" "}
          <code>EMAIL_SERVER</code> in <code>.env</code> to enable sign-in.
        </p>
      )}
    </div>
  );
}
