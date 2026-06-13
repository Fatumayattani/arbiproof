import { useState } from "react";
import { ReceiptLookup } from "./components/ReceiptLookup.js";


function Logo() {
  return (
    <svg width="46" height="46" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M24 3l18 6.4v11.3C42 33 34.4 42.6 24 47 13.6 42.6 6 33 6 20.7V9.4L24 3z" fill="#16202e" />
      <path d="M15.5 24.5l6 6L33 17.5" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function App() {
  const [receiptId, setReceiptId] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);

  return (
    <main className="wrap">
      <div className="topbar">
        <Logo />
        <h1 className="wordmark">ArbiProof</h1>
      </div>

      <p className="lede">
        Proof that an autonomous agent stayed inside the authority it was granted.
        Paste a receipt to audit what was permitted against what the agent did.
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
      {!submitted && (
        <p className="hint">Paste any ArbiProof receipt id to audit it against its onchain grant.</p>
      )}

      {submitted && <ReceiptLookup receiptId={submitted as `0x${string}`} />}

      <p className="foot">Every verdict is recomputed from the live transaction. The agent's word is never trusted.</p>
    </main>
  );
}