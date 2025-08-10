import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function Dashboard() {
  const [rows, setRows] = useState([]);
  const [ai, setAi] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id || import.meta.env.VITE_TEST_USER_ID; // temp fallback
        const since = new Date(Date.now()-6*24*60*60*1000).toISOString().slice(0,10);

        const { data: days, error: e1 } = await supabase
          .from("daily_metrics")
          .select("date,revenue_total,ad_spend,net_profit")
          .eq("user_id", userId).gte("date", since).order("date", { ascending:true });
        if (e1) throw e1;
        setRows(days||[]);

        const { data: aiRows, error: e2 } = await supabase
          .from("agent_outputs")
          .select("summary_text,adset_actions_json,pricing_tips_json,tips_to_improve,created_at,seven_day_profit,profit_climb")
          .eq("user_id", userId).order("created_at", { ascending:false }).limit(1);
        if (e2) throw e2;
        setAi(aiRows?.[0]||null);
      } catch (e) { setErr(e.message); }
    })();
  }, []);

  if (err) return <div style={{padding:20,color:'red'}}>Error: {err}</div>;
  const totals = rows.reduce((a,r)=>({
    rev:a.rev+(r.revenue_total||0), spend:a.spend+(r.ad_spend||0), prof:a.prof+(r.net_profit||0)
  }), {rev:0,spend:0,prof:0});

  return (
    <div style={{padding:20}}>
      <h1>7‑Day Overview</h1>
      <Stats label="Revenue" v={totals.rev}/>
      <Stats label="Ad Spend" v={totals.spend}/>
      <Stats label="Net Profit" v={totals.prof}/>
      <h2 style={{marginTop:20}}>Latest AI Recommendation</h2>
      {!ai ? <div>— none yet —</div> :
        <div style={{border:'1px solid #eee',borderRadius:12,padding:12}}>
          <p style={{whiteSpace:'pre-wrap'}}>{ai.summary_text}</p>
          <h3>Ad set actions</h3><List data={ai.adset_actions_json}/>
          <h3>Pricing tips</h3><List data={ai.pricing_tips_json}/>
          <h3>Other tips</h3><List data={ai.tips_to_improve}/>
          <small>Updated: {new Date(ai.created_at).toLocaleString()}</small>
        </div>}
    </div>
  );
}
function Stats({label,v}){return <div><b>{label}:</b> €{Number(v).toFixed(2)}</div>;}
function List({data}){ if(!Array.isArray(data)||!data.length) return <>—</>;
  return <ul>{data.map((x,i)=><li key={i}><code>{JSON.stringify(x)}</code></li>)}</ul> }
