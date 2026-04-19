import { ImageResponse } from "@vercel/og";
import { prisma } from "@/lib/prisma";
import { PPL_META, toCategory } from "@/lib/ppl";
import { workoutVolume, formatKg } from "@/lib/volume";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const w = await prisma.workout.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { username: true, name: true, image: true } },
      exercises: { include: { sets: true }, orderBy: { order: "asc" } },
      prs: true
    }
  });

  if (!w) return new Response("not found", { status: 404 });

  const meta = PPL_META[toCategory(w.category)];
  const volume = formatKg(workoutVolume(w.exercises));
  const topLifts = w.exercises
    .map((ex) => {
      const best = ex.sets.reduce(
        (b, s) =>
          s.weight * (1 + s.reps / 30) > b.e1
            ? { e1: s.weight * (1 + s.reps / 30), w: s.weight, r: s.reps }
            : b,
        { e1: 0, w: 0, r: 0 }
      );
      return { name: ex.name, weight: best.w, reps: best.r };
    })
    .filter((x) => x.weight > 0)
    .slice(0, 4);

  const prLabel =
    w.prs.length > 0
      ? `🏅 ${w.prs.length} new PR${w.prs.length > 1 ? "s" : ""}`
      : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1080px",
          height: "1920px",
          display: "flex",
          flexDirection: "column",
          background: "#0E1116",
          color: "white",
          padding: "80px",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px"
          }}
        >
          <div
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "22px",
              background: meta.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "56px",
              fontWeight: 900
            }}
          >
            IF
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: "40px", fontWeight: 800 }}>
              IronFeed
            </div>
            <div style={{ display: "flex", fontSize: "26px", opacity: 0.6 }}>
              {`@${w.user.username}`}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "120px",
            display: "flex",
            flexDirection: "column"
          }}
        >
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              padding: "12px 24px",
              borderRadius: "999px",
              background: meta.color,
              fontSize: "36px",
              fontWeight: 800
            }}
          >
            {meta.label.toUpperCase()}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "110px",
              lineHeight: 1.05,
              fontWeight: 900,
              marginTop: "24px"
            }}
          >
            {w.title}
          </div>
          {prLabel && (
            <div
              style={{
                display: "flex",
                marginTop: "28px",
                alignSelf: "flex-start",
                padding: "14px 28px",
                borderRadius: "999px",
                background: "#BA7517",
                color: "white",
                fontSize: "40px",
                fontWeight: 800
              }}
            >
              {prLabel}
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: "90px",
            display: "flex",
            flexDirection: "column",
            gap: "20px"
          }}
        >
          {topLifts.map((l) => (
            <div
              key={l.name}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "28px 36px",
                borderRadius: "28px",
                background: "rgba(255,255,255,0.06)",
                fontSize: "42px"
              }}
            >
              <div style={{ display: "flex", opacity: 0.9 }}>{l.name}</div>
              <div style={{ display: "flex", fontWeight: 800 }}>
                {`${l.weight}kg × ${l.reps}`}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: "44px",
            fontWeight: 800
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                opacity: 0.5,
                fontSize: "28px",
                fontWeight: 500
              }}
            >
              Total volume
            </div>
            <div style={{ display: "flex" }}>{volume}</div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end"
            }}
          >
            <div
              style={{
                display: "flex",
                opacity: 0.5,
                fontSize: "28px",
                fontWeight: 500
              }}
            >
              ironfeed.app
            </div>
            <div style={{ display: "flex" }}>#IronFeed</div>
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1920 }
  );
}
