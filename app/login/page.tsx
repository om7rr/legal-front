"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, type InitiateResponse } from "@/lib/api";
import { tokenStore } from "@/lib/auth";

type Phase = "enterId" | "awaitingApproval" | "rejected" | "noUser";

export default function LoginPage() {
  const router = useRouter();
  const [nationalId, setNationalId] = useState("1111111111");
  const [phase, setPhase] = useState<Phase>("enterId");
  const [tx, setTx] = useState<InitiateResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await api.initiate(nationalId.trim());
      setTx(res);
      setPhase("awaitingApproval");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "تعذّر بدء الدخول");
    } finally {
      setBusy(false);
    }
  }, [nationalId]);

  const simulateApproval = useCallback(async () => {
    if (!tx) return;
    setBusy(true);
    try {
      await api.simulateConfirm(tx.transactionId, true);
    } finally {
      setBusy(false);
    }
  }, [tx]);

  // Poll for completion while awaiting approval.
  useEffect(() => {
    if (phase !== "awaitingApproval" || !tx) return;
    let cancelled = false;
    const timer = setInterval(async () => {
      try {
        const s = await api.status(tx.transactionId);
        if (cancelled) return;
        if (s.status === "Completed" && s.accessToken) {
          tokenStore.set(s.accessToken);
          router.push("/cases");
        } else if (s.status === "Completed") {
          setPhase("noUser");
        } else if (s.status === "Rejected") {
          setPhase("rejected");
        }
      } catch {
        /* keep polling */
      }
    }, 1500);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [phase, tx, router]);

  return (
    <main className="wrap" style={{ maxWidth: 460 }}>
      <div className="brand">
        <span className="brand-name">المحاماة</span>
        <span className="brand-dot" />
      </div>
      <p className="sub">تسجيل الدخول عبر نفاذ</p>

      <div className="card">
        {phase === "enterId" && (
          <>
            <div className="field">
              <label htmlFor="nid">رقم الهوية الوطنية</label>
              <input
                id="nid"
                className="input"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                inputMode="numeric"
                placeholder="1xxxxxxxxx"
              />
            </div>
            <button className="btn" onClick={start} disabled={busy || !nationalId.trim()}>
              {busy ? "جارٍ…" : "الدخول عبر نفاذ"}
            </button>
            <p className="hint">
              بيئة اختبار — هويات متاحة: <span className="accent">1111111111</span> (مدير، مكتب أ) ·
              <span className="accent"> 2222222222</span> (محامٍ، مكتب أ) ·
              <span className="accent"> 3333333333</span> (مدير، مكتب ب)
            </p>
          </>
        )}

        {phase === "awaitingApproval" && tx && (
          <>
            <div className="card-title">افتح تطبيق نفاذ واختر الرقم</div>
            <div className="nafath-number">{tx.number}</div>
            <button className="btn" onClick={simulateApproval} disabled={busy}>
              محاكاة الموافقة (بيئة الاختبار)
            </button>
            <p className="hint">بانتظار الموافقة… سيتم تحويلك تلقائيًا بعد القبول.</p>
          </>
        )}

        {phase === "rejected" && (
          <>
            <span className="pill bad">● تم رفض الطلب</span>
            <button className="btn ghost" style={{ marginTop: "1rem" }} onClick={() => setPhase("enterId")}>
              إعادة المحاولة
            </button>
          </>
        )}

        {phase === "noUser" && (
          <>
            <span className="pill bad">● هوية موثّقة بلا مستخدم</span>
            <p className="hint">تم التحقق من الهوية، لكن لا يوجد مستخدم مرتبط بهذا الرقم في النظام.</p>
            <button className="btn ghost" style={{ marginTop: "1rem" }} onClick={() => setPhase("enterId")}>
              رجوع
            </button>
          </>
        )}

        {error && <p className="hint" style={{ color: "var(--red)" }}>{error}</p>}
      </div>
    </main>
  );
}
