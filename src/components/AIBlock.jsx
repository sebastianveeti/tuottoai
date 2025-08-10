// src/components/AIBlock.jsx
import { useEffect, useState } from "react";
import { supabase } from "../supabase";

// Helper: gracefully handle JSON columns that might arrive as string/null
function toArray(maybeJson) {
  if (!maybeJson) return [];
  if (Array.isArray(maybeJson)) return maybeJson;
  try { return JSON.parse(maybeJson); } catch { return []; }
}

export default function AIBlock() {
  const [items, setItems] = useState(null);  // null = loading, [] = no data

  useEffect(() => {
    const run = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Adjusted to your columns from the screenshot
      const { data, error } = await supabase
        .from("agent_outputs")
        .select("date, summary_text, adset_actions_json, pricing_tips_json, tips_to_improve")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(3);

      if (error) {
        console.error(error);
        setItems([]);
        return;
      }

      // Ensure arrays for rendering
      const cleaned = (data || []).map(r => ({
        ...r,
        adset_actions: toArray(r.adset_actions_json),
        pricing_tips:  toArray(r.pricing_tips_json),
      }));

      setItems(cleaned);
    };
    run();
  }, []);

  // Loading state
  if (items === null) {
    return (
      <section className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-semibold">AI Recommendations</h2>
        <p className="text-slate-600 mt-2">Loading…</p>
      </section>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <section className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-semibold">AI Recommendations</h2>
        <p className="text-slate-600 mt-2">No recommendations yet.</p>
      </section>
    );
  }

  // Data state
  return (
    <section className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-lg font-semibold">AI Recommendations</h2>
      <div className="space-y-4 mt-4">
        {items.map((r, i) => (
          <div key={i} className="border rounded-xl p-4">
            <div className="text-xs text-slate-500">{new Date(r.date).toLocaleString()}</div>

            {r.summary_text && <div className="font-medium mt-1">{r.summary_text}</div>}

            {r.adset_actions.length > 0 && (
              <div className="mt-2">
                <div className="text-sm font-semibold">Ad set actions</div>
                <ul className="list-disc ml-6 text-sm">
                  {r.adset_actions.map((a, idx) => <li key={idx}>{String(a)}</li>)}
                </ul>
              </div>
            )}

            {r.pricing_tips.length > 0 && (
              <div className="mt-2">
                <div className="text-sm font-semibold">Pricing tips</div>
                <ul className="list-disc ml-6 text-sm">
                  {r.pricing_tips.map((p, idx) => <li key={idx}>{String(p)}</li>)}
                </ul>
              </div>
            )}

            {r.tips_to_improve && (
              <div className="mt-2 text-sm text-slate-700 whitespace-pre-line">
                {r.tips_to_improve}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
