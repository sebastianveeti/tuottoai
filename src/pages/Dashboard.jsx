import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import COGSTable from "../components/COGSTable";

export default function Dashboard() {
  const [metrics, setMetrics] = useState([]);
  const [agentOutputs, setAgentOutputs] = useState([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [loadingOutputs, setLoadingOutputs] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch last 7 daily metrics
      const { data: metricsData, error: metricsError } = await supabase
        .from("daily_metrics")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(7);
      if (!metricsError) setMetrics(metricsData);
      setLoadingMetrics(false);

      // Fetch agent outputs
      const { data: outputsData, error: outputsError } = await supabase
        .from("agent_outputs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (!outputsError) setAgentOutputs(outputsData);
      setLoadingOutputs(false);
    };

    fetchData();
  }, []);

  return (
    <div className="p-4">
      {/* Metrics Table */}
      <h1 className="text-xl font-bold mb-4">Last 7 Days</h1>
      {loadingMetrics ? (
        <p>Loading metrics...</p>
      ) : (
        <table className="table-auto w-full border-collapse border border-gray-300 mb-6">
          <thead>
            <tr>
              <th className="border p-2">Date</th>
              <th className="border p-2">Revenue</th>
              <th className="border p-2">Ad Spend</th>
              <th className="border p-2">Orders</th>
              <th className="border p-2">Net Profit</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((row) => (
              <tr key={row.id}>
                <td className="border p-2">{row.date}</td>
                <td className="border p-2">${row.revenue_total}</td>
                <td className="border p-2">${row.ad_spend}</td>
                <td className="border p-2">{row.orders_count}</td>
                <td className="border p-2">${row.net_profit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* COGS Table */}
      <section className="mt-6">
        <COGSTable />
      </section>

      {/* Agent Outputs */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-4">AI Recommendations</h2>
        {loadingOutputs ? (
          <p>Loading recommendations...</p>
        ) : agentOutputs.length === 0 ? (
          <p className="text-gray-600">No recommendations yet.</p>
        ) : (
          <div className="space-y-4">
            {agentOutputs.map((output) => (
              <div
                key={output.id}
                className="border rounded-lg p-4 shadow-sm bg-white"
              >
                <p className="text-sm text-gray-500">
                  {new Date(output.created_at).toLocaleString()}
                </p>
                <p className="mt-2">{output.recommendation_text}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
