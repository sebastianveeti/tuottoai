import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function Cogs(){
  const [rows,setRows]=useState([]);
  const [msg,setMsg]=useState("");

  useEffect(()=>{ (async()=>{
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || import.meta.env.VITE_TEST_USER_ID;
    const { data } = await supabase.from("product_cogs").select("*").eq("user_id", userId).order("sku");
    setRows(data||[]);
  })(); },[]);

  function update(i, k, v){ const copy=[...rows]; copy[i][k]=v; setRows(copy); }

  async function save(i){
    setMsg("Saving...");
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || import.meta.env.VITE_TEST_USER_ID;
    const r = { ...rows[i], user_id:userId };
    const { error } = await supabase.from("product_cogs").upsert(r);
    setMsg(error? `Error: ${error.message}` : "Saved!");
    setTimeout(()=>setMsg(""),1200);
  }

  function add(){ setRows([...rows, { sku:"", cogs_value:0, shipping_pct:0.07, payment_fee_pct:0.03 }]); }

  return (
    <div style={{padding:20}}>
      <h1>Product COGS</h1>
      <button onClick={add}>+ Add row</button> <span>{msg}</span>
      <table border="1" cellPadding="6" style={{marginTop:12, borderCollapse:'collapse', width:'100%'}}>
        <thead><tr><th>SKU</th><th>COGS (€)</th><th>Shipping %</th><th>Payment %</th><th></th></tr></thead>
        <tbody>
        {rows.map((r,i)=>(
          <tr key={i}>
            <td><input value={r.sku||""} onChange={e=>update(i,"sku",e.target.value)}/></td>
            <td><input type="number" value={r.cogs_value||0} onChange={e=>update(i,"cogs_value",parseFloat(e.target.value))}/></td>
            <td><input type="number" step="0.01" value={r.shipping_pct||0} onChange={e=>update(i,"shipping_pct",parseFloat(e.target.value))}/></td>
            <td><input type="number" step="0.01" value={r.payment_fee_pct||0} onChange={e=>update(i,"payment_fee_pct",parseFloat(e.target.value))}/></td>
            <td><button onClick={()=>save(i)}>Save</button></td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
}
