"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import apiClient from "@/api/client";
import { getAccessToken } from "@/utils/cookies";
import { accountLinkRedirect, clearAuthReturn, rememberAuthReturn } from "@/utils/auth-return";

type Consent = { clientName: string; redirectUri: string; expiresAt: number; account: string; cancelUrl: string };

export default function ConnectAccount() {
  const router = useRouter();
  const transaction = useSearchParams().get("transaction") || "";
  const ar = useLocale() === "ar";
  const [consent, setConsent] = useState<Consent | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!/^[A-Za-z0-9_-]{43}$/.test(transaction)) {
      setError(ar ? "ابدأ ربط الحساب من تطبيق الذكاء الاصطناعي." : "Start account linking from your AI client."); return;
    }
    const returnTo = `/mcp/connect?transaction=${transaction}`;
    if (!getAccessToken()) {
      rememberAuthReturn(returnTo);
      router.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`); return;
    }
    let active = true;
    apiClient.get<Consent>(`/mcp/account-link/requests/${transaction}`, { skipErrorToast: true })
      .then(({ data }) => { if (active) setConsent(data); })
      .catch(() => { if (active) setError(ar ? "انتهت صلاحية الطلب أو تعذر الاتصال. أعد الربط من تطبيقك." : "This request expired or Civify could not connect. Restart account linking from your AI client."); });
    return () => { active = false; };
  }, [transaction, router, ar]);

  async function connect() {
    if (busy || !consent) return;
    if (consent.expiresAt <= Date.now()) { setError(ar ? "انتهت صلاحية الطلب. أعد الربط." : "This request expired. Restart account linking."); return; }
    setBusy(true); setError("");
    try {
      const { data } = await apiClient.post<{ redirectUrl: string }>("/mcp/account-link/authorize", { transaction }, { skipErrorToast: true });
      const destination = accountLinkRedirect(data.redirectUrl);
      clearAuthReturn();
      window.location.assign(destination);
    } catch {
      setError(ar ? "تعذر ربط الحساب. حاول مرة أخرى أو أعد الربط من تطبيقك." : "Could not connect your account. Try again or restart linking from your AI client.");
      setBusy(false);
    }
  }

  function cancel() {
    if (!consent || busy) return;
    try { clearAuthReturn(); window.location.assign(accountLinkRedirect(consent.cancelUrl)); }
    catch { setError("Restart account linking from your AI client."); }
  }

  return <main className="mx-auto flex min-h-[80vh] max-w-xl items-center px-6 py-12" dir={ar ? "rtl" : "ltr"}>
    <section className="w-full space-y-5 rounded-2xl border bg-card p-8 shadow-sm">
      <p className="text-sm font-medium text-primary">Civify</p>
      <h1 className="text-2xl font-semibold">{ar ? "ربط حسابك بمساعد الذكاء الاصطناعي" : "Connect your account to your AI assistant"}</h1>
      {error && <p role="alert" className="text-destructive">{error}</p>}
      {!consent && !error && <p role="status">{ar ? "جارٍ تحميل طلب الاتصال…" : "Loading the connection request…"}</p>}
      {consent && <>
        <p>{ar ? "التطبيق يعرّف نفسه باسم: " : "The requesting app identifies itself as: "}<strong>{consent.clientName}</strong></p>
        <p className="break-all text-sm text-muted-foreground">{ar ? "عنوان العودة: " : "Return address: "}{consent.redirectUri}</p>
        <p>{ar ? "الحساب: " : "Account: "}<strong>{consent.account}</strong></p>
        <p>{ar ? "اسمح لهذا التطبيق بالاطلاع على حسابك وسيرك الذاتية، وتخصيصها وتقييمها وإخفاء البيانات وتصدير الملفات، وإدارة طلبات العمل وبدء عمليات الشراء." : "Allow this app to read your account and resumes, tailor and score CVs, mask personal details, export documents, manage job applications, and start purchase checkouts."}</p>
        <p className="text-sm text-muted-foreground">{ar ? "عمليات الذكاء الاصطناعي تستهلك رصيد حسابك. الدفع يتطلب إتمام صفحة الدفع. تنتهي صلاحية الاتصال بعد 30 يومًا ويمكنك إلغاؤه من إعدادات الوصول." : "AI operations use your account credits. Payments require checkout. Access expires after 30 days and can be revoked in your access settings."}</p>
        <div className="flex gap-3">
          <Button onClick={connect} disabled={busy}>{busy ? (ar ? "جارٍ الربط…" : "Connecting…") : (ar ? "السماح والربط" : "Allow and connect")}</Button>
          <Button onClick={cancel} variant="outline" disabled={busy}>{ar ? "إلغاء" : "Cancel"}</Button>
        </div>
      </>}
      <Link href="/app/api-keys" className="block text-sm underline">{ar ? "إدارة صلاحيات الوصول" : "Manage account access"}</Link>
    </section>
  </main>;
}
