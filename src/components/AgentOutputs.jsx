import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function AgentOutputs() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("agent_outputs")
        .select("id, created_at, recommendation_text")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error(error);
      } else {
        setRows(data || []);
      }
      setLoading(false);
    };

    load();
  }, []);

  if (loading) return <div className="text-slate-600">Loading recommendations…</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
      <h2 className="text-lg font-semibold mb-4">Latest AI Recommendations</h2>
      {rows.length === 0 ? (
        <p className="text-slate-600">No recommendations yet.</p>
      ) : (
        <ul className="space-y-4">
          {rows.map((r) => (
            <li key={r.id} className="border-b pb-2 last:border-b-0">
              <p className="whitespace-pre-wrap">{r.recommendation_text}</p>
              <small className="text-slate-500">
                {new Date(r.created_at).toLocaleString()}
              </small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
