import { useState } from "react";
import { ReceiptLookup } from "./components/ReceiptLookup.js";

const DEMO_RECEIPT = "0x221cd2014c4f2bf3a2dfffcc15428cde0bcbd3383bfdf08c75beb29a5cbe3f17";

function Mark() {
  // brackets are the granted scope, the check is the verified action inside it
  return (
    <svg className="mark" width="38" height="32" viewBox="0 0 40 34" fill="none" aria-hidden="true">
      <path d="M15 7H10V27H15" stroke="#16202e" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M25 7H30V27H25" stroke="#16202e" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 18L19.5 21.5L26 13" stroke="#15784a" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function App() {
  const [receiptId, setReceiptId] = useState(DEMO_RECEIPT);
  const [submitted, setSubmitted] = useState<string | null>(DEMO_RECEIPT);

  return (
    <main className="wrap">
      <div className="topbar">
        <div className="brand">
          <Mark />
          <h1 className="wordmark">ArbiProof</h1>
        </div>
        <span className="pill"><span className="dot" />Arbitrum Sepolia</span>
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
