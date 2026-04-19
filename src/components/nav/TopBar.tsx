import Link from "next/link";
import { SignOutButton } from "./SignOutButton";

export function TopBar({
  username,
  image
}: {
  username: string | null;
  image: string | null | undefined;
}) {
  const profileHref = username ? `/profile/${username}` : "/feed";
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-ink-900/80 backdrop-blur border-b border-black/5 dark:border-white/5">
      <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/feed" className="flex items-center gap-2 font-bold">
          <span className="w-8 h-8 rounded-lg bg-push flex items-center justify-center text-white text-sm font-black">
            IF
          </span>
          IronFeed
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/invite" className="chip-pull">
            + Invite
          </Link>
          <Link
            href={profileHref}
            className="w-8 h-8 rounded-full overflow-hidden bg-black/10 dark:bg-white/10"
            aria-label="My profile"
          >
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="me" className="w-full h-full object-cover" />
            ) : null}
          </Link>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
