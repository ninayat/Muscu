"use client";

import { useState, useTransition } from "react";

export function FollowButton({
  userId,
  initial
}: {
  userId: string;
  initial: boolean;
}) {
  const [following, setFollowing] = useState(initial);
  const [pending, start] = useTransition();

  const toggle = () =>
    start(async () => {
      const prev = following;
      setFollowing((v) => !v);
      const res = await fetch(`/api/follow/${userId}`, { method: "POST" });
      if (!res.ok) {
        setFollowing(prev);
        return;
      }
      const data = (await res.json()) as { following: boolean };
      setFollowing(data.following);
    });

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={following ? "btn-ghost" : "btn-primary"}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
