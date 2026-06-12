export function VerdictBadge({ pass }: { pass: boolean }) {
  const bg = pass ? "#0a7d2c" : "#b00020";
  const label = pass ? "PASS" : "FAIL";
  return (
    <span style={{
      background: bg, color: "white", padding: "4px 12px",
      borderRadius: 6, fontWeight: 700, letterSpacing: 1
    }}>
      {label}
    </span>
  );
}
