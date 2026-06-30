import { useEffect, useState } from "react";
import { api } from "../lib/api";
import BadgeDisplay from "../components/BadgeDisplay";
import { Trophy, Medal } from "lucide-react";

const rankIcons = {
  1: <Trophy size={20} className="text-yellow-400" />,
  2: <Medal size={20} className="text-gray-300" />,
  3: <Medal size={20} className="text-amber-600" />,
};

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/users/leaderboard?limit=20").then((res) => {
      if (res.success) setUsers(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[var(--fg-muted)]">
          <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading leaderboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-yellow-400/10">
              <Trophy size={24} className="text-yellow-400" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[var(--fg)] tracking-tight" style={{ fontFamily: '"Sora", sans-serif' }}>
                Leaderboard
              </h1>
              <p className="text-[var(--fg-muted)] text-sm mt-0.5">Top community heroes</p>
            </div>
          </div>
        </div>

        {users.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center animate-fade-in-up">
            <Trophy size={48} className="text-white/[0.08] mx-auto mb-4" />
            <p className="text-[var(--fg-muted)] text-lg">No heroes yet</p>
            <p className="text-[var(--fg-subtle)] text-sm mt-1">Report an issue to get on the board!</p>
          </div>
        ) : (
          <div className="space-y-2 stagger-children">
            {users.map((u, i) => (
              <div
                key={u.id}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 ${
                  i === 0
                    ? "border-yellow-400/20 bg-yellow-400/[0.04] hover:bg-yellow-400/[0.06]"
                    : i === 1
                    ? "border-gray-300/15 bg-gray-300/[0.03] hover:bg-gray-300/[0.05]"
                    : i === 2
                    ? "border-amber-600/15 bg-amber-600/[0.03] hover:bg-amber-600/[0.05]"
                    : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                }`}
              >
                <div className="w-8 flex justify-center shrink-0">
                  {rankIcons[u.rank] || (
                    <span className="text-[var(--fg-subtle)] font-mono text-sm">#{u.rank}</span>
                  )}
                </div>

                <div className="w-10 h-10 rounded-full bg-white/[0.05] overflow-hidden shrink-0 ring-1 ring-white/[0.08]">
                  {u.photoURL ? (
                    <img src={u.photoURL} alt={u.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--fg-muted)] font-bold text-sm">
                      {(u.name || "?")[0]}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--fg)] truncate">{u.name || "Anonymous"}</p>
                  <p className="text-xs text-[var(--fg-muted)]">
                    {u.issuesReported || 0} reported · {u.issuesVerified || 0} verified
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-bold text-[var(--fg)]">{u.points || 0}</p>
                  <p className="text-xs text-[var(--fg-subtle)]">points</p>
                </div>

                {u.badges?.length > 0 && (
                  <div className="hidden sm:block shrink-0">
                    <BadgeDisplay badges={u.badges} size={20} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
