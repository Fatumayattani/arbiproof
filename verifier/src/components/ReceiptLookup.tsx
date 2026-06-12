import { useEffect, useState } from "react";
import { verify, type Verdict } from "../lib/registry.js";
import { VerdictBadge } from "./VerdictBadge.js";

export function ReceiptLookup({ receiptId }: { receiptId: `0x${string}` }) {
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    verify(receiptId)
      .then(setVerdict)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [receiptId]);

  if (loading) return <p>checking receipt...</p>;
  if (error) return <p style={{ color: "#b00020" }}>{error}</p>;
  if (!verdict) return null;

  const arbiscan = `https://sepolia.arbiscan.io/tx/${verdict.txHash}`;

  return (
    <section style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Verdict</h2>
        <VerdictBadge pass={verdict.pass} />
      </div>

      {!verdict.pass && (
        <ul>
          {verdict.reasons.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      )}

      <h3>Granted authority</h3>
      <p>target {verdict.grant.target}</p>
      <p>allowed recipient {verdict.grant.recipient}</p>
      <p>per call cap {String(verdict.grant.maxAmount)}</p>

      <h3>What the agent actually did</h3>
      {verdict.decoded ? (
        <>
          <p>recipient {verdict.decoded.recipient}</p>
          <p>amount {String(verdict.decoded.amount)}</p>
        </>
      ) : <p>could not decode the action</p>}

      <p><a href={arbiscan} target="_blank" rel="noreferrer">view tx on Arbiscan</a></p>
    </section>
  );
}
