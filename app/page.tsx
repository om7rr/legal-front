"use client";

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5080";

interface HealthCheck {
  name: string;
  status: string;
  description?: string;
}

interface HealthReport {
  status: string;
  checks?: HealthCheck[];
}

export default function Home() {
  const [report, setReport] = useState<HealthReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/health/ready`)
      .then((res) => res.json() as Promise<HealthReport>)
      .then((data) => {
        if (!cancelled) setReport(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const healthy = report?.status === "Healthy";

  return (
    <main className="wrap">
      <div className="brand">
        <span className="brand-name">المحاماة</span>
        <span className="brand-dot" />
      </div>
      <p className="sub">منصة إدارة المكاتب القانونية — واجهة الويب (Next.js)</p>

      <div className="card">
        <div className="card-title">حالة الخدمة الخلفية (Backend)</div>

        {error && (
          <>
            <span className="pill bad">● غير متصل</span>
            <p className="hint">
              تعذّر الوصول إلى الخادم على <span className="accent">{API_BASE}</span>. شغّل مشروع
              <span className="accent"> legal-back</span> وقاعدة البيانات من <span className="accent">legal-db</span>.
              <br />
              <code>{error}</code>
            </p>
          </>
        )}

        {!error && !report && <span className="pill">جارٍ الفحص…</span>}

        {report && (
          <>
            <span className={`pill ${healthy ? "ok" : "bad"}`}>
              {healthy ? "● سليم" : "● غير سليم"} — {report.status}
            </span>
            <div style={{ marginTop: "1rem" }}>
              {report.checks?.map((c) => (
                <div className="check" key={c.name}>
                  <span className="name">{c.name}</span>
                  <span className={c.status === "Healthy" ? "ok" : "bad"}>{c.status}</span>
                </div>
              ))}
            </div>
          </>
        )}

        <p className="hint">
          هذه الواجهة تستدعي <span className="accent">{API_BASE}/health/ready</span> لإثبات الربط بين
          الواجهة والخادم. لاحقًا تُبنى عليها شاشات القضايا والجلسات والعملاء.
        </p>
      </div>
    </main>
  );
}
