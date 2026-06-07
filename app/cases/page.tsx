"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, type CaseListItem } from "@/lib/api";
import { tokenStore } from "@/lib/auth";

const emptyForm = { caseNumber: "", title: "", type: "tijari", court: "" };

export default function CasesPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [cases, setCases] = useState<CaseListItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const logout = useCallback(() => {
    tokenStore.clear();
    router.replace("/login");
  }, [router]);

  const refresh = useCallback(
    async (t: string) => {
      try {
        setCases(await api.listCases(t));
      } catch (e: unknown) {
        // Token likely expired/invalid → back to login.
        if (e instanceof Error && e.message.startsWith("401")) {
          logout();
        } else {
          setError(e instanceof Error ? e.message : "تعذّر تحميل القضايا");
        }
      }
    },
    [logout],
  );

  useEffect(() => {
    const t = tokenStore.get();
    if (!t) {
      router.replace("/login");
      return;
    }
    setToken(t);
    void refresh(t);
  }, [router, refresh]);

  const submit = useCallback(async () => {
    if (!token) return;
    setError(null);
    setBusy(true);
    try {
      const res = await api.createCase(token, {
        ...form,
        clientId: crypto.randomUUID(),
        leadLawyerId: crypto.randomUUID(),
      });
      if (res.status === 201) {
        setForm(emptyForm);
        await refresh(token);
      } else if (res.status === 401) {
        logout();
      } else {
        setError(`${res.status}: ${await res.text()}`);
      }
    } finally {
      setBusy(false);
    }
  }, [token, form, refresh, logout]);

  if (!token) return null;

  return (
    <main className="wrap">
      <div className="row-between">
        <div className="brand">
          <span className="brand-name">قضايا المكتب</span>
          <span className="brand-dot" />
        </div>
        <button className="btn ghost btn-sm" onClick={logout}>
          تسجيل الخروج
        </button>
      </div>

      <div className="card" style={{ marginBottom: "1.25rem" }}>
        <div className="card-title">قضية جديدة</div>
        <div className="grid2">
          <input className="input" placeholder="رقم القضية" value={form.caseNumber}
            onChange={(e) => setForm({ ...form, caseNumber: e.target.value })} />
          <input className="input" placeholder="العنوان" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className="input" placeholder="النوع" value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })} />
          <input className="input" placeholder="المحكمة" value={form.court}
            onChange={(e) => setForm({ ...form, court: e.target.value })} />
        </div>
        <button className="btn" style={{ marginTop: "0.9rem" }} onClick={submit}
          disabled={busy || !form.caseNumber.trim() || !form.title.trim()}>
          {busy ? "جارٍ…" : "إضافة القضية"}
        </button>
      </div>

      {error && <p className="hint" style={{ color: "var(--red)" }}>{error}</p>}

      <div className="card">
        <div className="card-title">القضايا ({cases.length})</div>
        {cases.length === 0 ? (
          <p className="hint">لا توجد قضايا بعد.</p>
        ) : (
          <table className="tbl">
            <thead>
              <tr><th>الرقم</th><th>العنوان</th><th>المحكمة</th><th>الحالة</th></tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c.id}>
                  <td>{c.caseNumber}</td>
                  <td>{c.title}</td>
                  <td>{c.court}</td>
                  <td><span className="pill ok">{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
