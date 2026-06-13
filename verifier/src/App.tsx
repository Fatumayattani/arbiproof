import { useState } from "react";
import { ReceiptLookup } from "./components/ReceiptLookup.js";

const DEMO_RECEIPT = "0x221cd2014c4f2bf3a2dfffcc15428cde0bcbd3383bfdf08c75beb29a5cbe3f17";

export function App() {
  const [receiptId, setReceiptId] = useState(DEMO_RECEIPT);
  const [submitted, setSubmitted] = useState<string | null>(DEMO_RECEIPT);

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      <h1>ArbiProof</h1>
      <p>Verify that an agent stayed within its granted authority.</p>

      <div style={{ display: "flex", gap: 8, margin: "16px 0" }}>
        <input
          value={receiptId}
          onChange={(e) => setReceiptId(e.target.value)}
          placeholder="0x receipt id"
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={() => setSubmitted(receiptId.trim())}>Verify</button>
      </div>

      {submitted && <ReceiptLookup receiptId={submitted as `0x${string}`} />}
    </main>
  );
}