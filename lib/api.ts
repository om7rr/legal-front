// Typed client for the legal-back API.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5080";

export interface InitiateResponse {
  transactionId: string;
  number: string;
  message: string;
}

export interface AuthStatus {
  status: string;
  accessToken?: string;
  refreshToken?: string;
  expiresInSeconds?: number;
  message?: string;
}

export interface CaseListItem {
  id: string;
  caseNumber: string;
  title: string;
  type: string;
  court: string;
  status: string;
}

export interface CreateCaseInput {
  caseNumber: string;
  title: string;
  type: string;
  court: string;
  clientId: string;
  leadLawyerId: string;
}

async function asJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(`${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as T;
}

const jsonHeaders = { "Content-Type": "application/json" } as const;

export const api = {
  apiBase: API_BASE,

  initiate: (nationalId: string) =>
    fetch(`${API_BASE}/api/auth/nafath/initiate`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ nationalId }),
    }).then((r) => asJson<InitiateResponse>(r)),

  // Test environment only — simulates the user approving in their Nafath app.
  simulateConfirm: (transactionId: string, accept = true) =>
    fetch(`${API_BASE}/api/auth/nafath/_simulate-confirm`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ transactionId, accept }),
    }),

  status: (transactionId: string) =>
    fetch(`${API_BASE}/api/auth/nafath/status/${transactionId}`).then((r) => asJson<AuthStatus>(r)),

  listCases: (token: string) =>
    fetch(`${API_BASE}/api/cases`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => asJson<CaseListItem[]>(r)),

  createCase: (token: string, input: CreateCaseInput) =>
    fetch(`${API_BASE}/api/cases`, {
      method: "POST",
      headers: { ...jsonHeaders, Authorization: `Bearer ${token}` },
      body: JSON.stringify(input),
    }),
};
