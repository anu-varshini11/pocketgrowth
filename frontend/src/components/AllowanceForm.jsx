import { useState } from "react";

export default function AllowanceForm({ user, refreshUserData }) {
  const [amount, setAmount] = useState("");
  const [lockAmount, setLockAmount] = useState("");
  const [lockOnly, setLockOnly] = useState(false);
  const [message, setMessage] = useState("");

  const API_BASE = import.meta.env.VITE_BACKEND_URL || "https://pocketgrowth.onrender.com";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("⏳ Adding allowance...");

    const amt = Number(amount);
    if (!amt || amt <= 0) {
      setMessage("❌ Enter a valid amount");
      return;
    }

    try {
      const payload = {
        userId: user.id,
        amount: amt,
        lockAmount: lockOnly ? amt : (lockAmount ? Number(lockAmount) : 0),
      };

      const res = await fetch(`${API_BASE}/api/users/allowance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Allowance added");
        setAmount("");
        setLockAmount("");
        setLockOnly(false);
        if (refreshUserData) await refreshUserData();
      } else {
        setMessage(`❌ ${data.error || "Failed"}`);
      }
    } catch (err) {
      setMessage("❌ Network error");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "12px" }}>
      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="number"
          placeholder="Amount (₹)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          style={{ padding: "8px", borderRadius: "6px", width: "140px" }}
        />

        {!lockOnly && (
          <input
            type="number"
            placeholder="Lock amount (optional ₹)"
            value={lockAmount}
            onChange={(e) => setLockAmount(e.target.value)}
            style={{ padding: "8px", borderRadius: "6px", width: "160px" }}
          />
        )}

        <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <input type="checkbox" checked={lockOnly} onChange={(e) => setLockOnly(e.target.checked)} />
          Deposit to locked only
        </label>

        <button type="submit" style={{ padding: "8px 12px", borderRadius: "6px", background: "#22c55e", color: "white", border: "none" }}>
          Add
        </button>
      </div>

      <p style={{ marginTop: "6px", color: "#64748b" }}>{message}</p>
      <p style={{ marginTop: "6px", fontSize: "0.9rem", color: "#64748b" }}>
        Tip: check "Deposit to locked only" to directly add the full amount into locked savings.
      </p>
    </form>
  );
}
