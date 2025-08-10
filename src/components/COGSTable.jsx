import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function COGSTable() {
  const [rows, setRows] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data, error } = await supabase
        .from("product_cogs")
        .select("id, sku, cogs_value, shipping_pct, payment_fee_pct")
        .eq("user_id", user.id)
        .order("sku", { ascending: true });

      if (error) console.error(error);
      setRows(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const addBlank = () => {
    setRows(r => [...r, { id: `new-${crypto.randomUUID()}`, sku: "", cogs_value: 0, shipping_pct: 0, payment_fee_pct: 0, _new: true }]);
  };

  const updateCell = (i, field, value) => {
    setRows(prev => {
      const copy = [...prev];
      copy[i] = { ...copy[i], [field]: value };
      return copy;
    });
  };

  const saveRow = async (i) => {
    if (!userId) return;
    setSaving(true);
    const row = rows[i];

    const payload = {
      user_id: userId,
      sku: row.sku,
      cogs_value: Number(row.cogs_value) || 0,
      shipping_pct: Number(row.shipping_pct) || 0,
      payment_fee_pct: Number(row.payment_fee_pct) || 0,
    };

    let resp;
    if (String(row.id).startsWith("new-") || row._new) {
      resp = await supabase.from("product_cogs").insert(payload).select().single();
    } else {
      resp = await supabase.from("product_cogs").update(payload).eq("id", row.id).select().single();
    }

    if (resp.error) {
      console.error(resp.error);
      alert(resp.error.message);
    } else {
      setRows(prev => {
        const copy = [...prev];
        copy[i] = resp.data;
        return copy;
      });
    }
    setSaving(false);
  };

  const deleteRow = async (i) => {
    const row = rows[i];
    if (String(row.id).startsWith("new-") || row._new) {
      setRows(prev => prev.filter((_, idx) => idx !== i));
      return;
    }
    const { error } = await supabase.from("product_cogs").delete().eq("id", row.id);
    if (error) {
      console.error(error);
      alert(error.message);
    } else {
      setRows(prev => prev.filter((_, idx) => idx !== i));
    }
  };

  if (loading) return <div className="text-slate-600">Loading COGS…</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Product COGS</h2>
        <button onClick={addBlank} className="rounded-md bg-black text-white px-3 py-1.5">+ Add row</button>
      </div>

      <div className="overflow-x-auto mt-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">SKU</th>
              <th className="py-2 pr-4">COGS (€)</th>
              <th className="py-2 pr-4">Shipping %</th>
              <th className="py-2 pr-4">Payment Fee %</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="py-2 pr-4">
                  <input className="w-40 border rounded px-2 py-1" value={r.sku || ""} onChange={e => updateCell(i, "sku", e.target.value)} />
                </td>
                <td className="py-2 pr-4">
                  <input className="w-28 border rounded px-2 py-1" type="number" step="0.01" value={r.cogs_value ?? 0} onChange={e => updateCell(i, "cogs_value", e.target.value)} />
                </td>
                <td className="py-2 pr-4">
                  <input className="w-24 border rounded px-2 py-1" type="number" step="0.1" value={r.shipping_pct ?? 0} onChange={e => updateCell(i, "shipping_pct", e.target.value)} />
                </td>
                <td className="py-2 pr-4">
                  <input className="w-24 border rounded px-2 py-1" type="number" step="0.1" value={r.payment_fee_pct ?? 0} onChange={e => updateCell(i, "payment_fee_pct", e.target.value)} />
                </td>
                <td className="py-2 pr-4 space-x-2">
                  <button onClick={() => saveRow(i)} disabled={saving} className="rounded-md bg-black text-white px-3 py-1.5 disabled:opacity-50">Save</button>
                  <button onClick={() => deleteRow(i)} className="rounded-md border px-3 py-1.5">Delete</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td className="py-4 text-slate-600" colSpan={5}>No COGS yet. Click “Add row”.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
