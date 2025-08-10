import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

export default function AuthGuard({ children }) {
  const [checking, setChecking] = useState(true);
  const [ok, setOk] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      if (session) setOk(true);
      else navigate('/login', { replace: true });
      setChecking(false);
    };

    check();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate('/login', { replace: true });
    });

    return () => {
      mounted = false;
      sub.subscription?.unsubscribe?.();
    };
  }, [navigate]);

  if (checking) return <div className="p-6 text-slate-600">Checking session…</div>;
  return ok ? children : null;
}
