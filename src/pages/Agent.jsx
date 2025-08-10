import { useState } from "react";
import { supabase } from "../supabase";

export default function Agent(){
  const [busy,setBusy]=useState(false);
  const [resp,setResp]=useState(null);
  const [err,setErr]=useState("");

  async function run(){
    setBusy(true); setErr(""); setResp(null);
    try{
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || import.meta.env.VITE_TEST_USER_ID;
      const res = await fetch(import.meta.env.VITE_N8N_WEBHOOK_URL, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ user_id: userId })
      });
      if(!res.ok) throw new Error(`Agent failed (${res.status})`);
      const data = await res.json();
      setResp(data);
    }catch(e){ setErr(e.message); }
    finally{ setBusy(false); }
  }

  return (
    <div style={{padding:20}}>
      <h1>Run Tuotto Agent</h1>
      <button onClick={run} disabled={busy}>{busy? "Running…" : "Run now"}</button>
      {err && <div style={{color:'red', marginTop:12}}>Error: {err}</div>}
      {resp && <pre style={{marginTop:12}}>{JSON.stringify(resp,null,2)}</pre>}
      <p style={{marginTop:8}}>Tip: after a run, refresh Dashboard to see the latest AI row.</p>
    </div>
  );
}
