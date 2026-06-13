import { useState } from "react";
import { ReceiptLookup } from "./components/ReceiptLookup.js";

const DEMO_RECEIPT = "0x221cd2014c4f2bf3a2dfffcc15428cde0bcbd3383bfdf08c75beb29a5cbe3f17";

function Logo() {
  return (
    <svg width="46" height="46" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M24 3l18 6.4v11.3C42 33 34.4 42.6 24 47 13.6 42.6 6 33 6 20.7V9.4L24 3z" fill="#16202e" />
      <path d="M15.5 24.5l6 6L33 17.5" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function App() {
  const [receiptId, setReceiptId] = useState(DEMO_RECEIPT);
  const [submitted, setSubmitted] = useState<string | null>(DEMO_RECEIPT);

  return (
    <main className="wrap">
      <div className="topbar">
        <Logo />
        <h1 className="wordmark">ArbiProof</h1>
      </div>

      <p className="lede">
        Proof that an autonomous agent stayed inside the authority it was granted.
        Paste a receipt to audit <strong>what was permitted</strong> against{" "}
        <strong>what the agent did</strong>.
      </p>

      <div className="search">
        <input
          value={receiptId}
          onChange={(e) => setReceiptId(e.target.value)}
          placeholder="0x receipt id"
          spellCheck={false}
        />
        <button onClick={() => setSubmitted(receiptId.trim())}>Verify</button>
      </div>

      {submitted && <ReceiptLookup receiptId={submitted as `0x${string}`} />}

      <p className="foot">Every verdict is recomputed from the live transaction. The agent's word is never trusted.</p>
    </main>
  );
}