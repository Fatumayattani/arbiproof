import { useEffect, useState } from "react";
import { verify, type Verdict } from "../lib/registry.js";

function Tick({ ok }: { ok: boolean }) {
  return ok ? (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-label="match">
      <path d="M4 10.5L8 14.5L16 6" stroke="#15784a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-label="violation">
      <path d="M5 5L15 15M15 5L5 15" stroke="#bb352b" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function ago(ts: bigint) {
  const secs = Math.floor(Date.now() / 1000) - Number(ts);
  if (secs < 60) return "just now";
  if (secs < 3600) return `${Math.floor(secs / 60)} min ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)} h ago`;
  return `${Math.floor(secs / 86400)} d ago`;
}

function short(s: string) {
  return `${s.slice(0, 6)}\u2026${s.slice(-4)}`;
}

export function ReceiptLookup({ receiptId }: { receiptId: `0x${string}` }) {
  const [v, setV] = useState<Verdict | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    verify(receiptId)
      .then(setV)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [receiptId]);

  if (loading) return <p className="status-msg">Reading the receipt from Arbitrum…</p>;
  if (error) return <p className="status-msg err">{error} Check the id and try again.</p>;
  if (!v) return null;

  const arbiscan = `https://sepolia.arbiscan.io/tx/${v.txHash}`;
  const failed = v.checks.filter((c) => !c.ok).map((c) => c.label.toLowerCase());

  const stampStyle = {
    "--stamp-c": v.pass ? "var(--cleared)" : "var(--flagged)",
    "--stamp-bg": v.pass ? "var(--cleared-bg)" : "var(--flagged-bg)"
  } as React.CSSProperties;
  const edgeStyle = {
    "--verdict-edge": v.pass ? "var(--cleared)" : "var(--flagged)"
  } as React.CSSProperties;

  return (
    <section className="cert" style={edgeStyle}>
      <span className="stamp" style={stampStyle}>{v.pass ? "CLEARED" : "FLAGGED"}</span>

      <div className="cert-head">
        <div className="eyebrow">Receipt</div>
        <p className="receipt-id">{short(receiptId)}</p>
        <div className="cert-meta">
          <span><span className="k">agent</span> {short(v.agent)}</span>
          <span><span className="k">intent</span> {short(v.intentHash)}</span>
          <span><span className="k">recorded</span> {ago(v.timestamp)}</span>
        </div>
      </div>

      <div className="ledger">
        <div className="ledger-head">
          <span className="h-rule">Rule</span>
          <span className="h-auth">Authorized</span>
          <span className="h-exec">Executed</span>
          <span />
        </div>
        {v.checks.map((c) => (
          <div className="ledger-row" key={c.label}>
            <div className="cell-rule">{c.label}</div>
            <div className="cell-auth">{c.authorized}</div>
            <div className={`cell-exec${c.ok ? "" : " bad"}`}>{c.executed}</div>
            <div className="cell-status"><Tick ok={c.ok} /></div>
          </div>
        ))}
      </div>

      {v.pass ? (
        <div className="summary ok">
          <span className="tag">WITHIN AUTHORITY</span>
          <span>Every executed value fell inside the granted scope.</span>
        </div>
      ) : (
        <div className="summary no">
          <span className="tag">EXCEEDED AUTHORITY</span>
          <span>The {failed.join(" and ")} broke the bounds of the grant.</span>
        </div>
      )}

      <a className="tx-link" href={arbiscan} target="_blank" rel="noreferrer">
        View transaction on Arbiscan
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <path d="M5 3h8v8M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </section>
  );
}
