import { useState } from "react";

export default function AllowanceForm({ user, refreshUserData }) {
  const [amount, setAmount] = useState("");
  const [lockAmount, setLockAmount] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("⏳ Adding allowance...");
    try {
      const res = await fetch("http://localhost:5000/api/allowance/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          amount,
          lockAmount: lockAmount || 0,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "✅ Allowance added");
        setAmount("");
        setLockAmount("");
        // refresh stored user data
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
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <input
          type="number"
          placeholder="Amount (₹)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          style={{ padding: "8px", borderRadius: "6px", width: "140px" }}
        />
        <input
          type="number"
          placeholder="Lock amount (optional ₹)"
          value={lockAmount}
          onChange={(e) => setLockAmount(e.target.value)}
          style={{ padding: "8px", borderRadius: "6px", width: "160px" }}
        />
        <button type="submit" style={{ padding: "8px 12px", borderRadius: "6px", background: "#22c55e", color: "white", border: "none" }}>
          Add
        </button>
      </div>
      <p style={{ marginTop: "6px", color: "#64748b" }}>{message}</p>
      <p style={{ marginTop: "6px", fontSize: "0.9rem", color: "#64748b" }}>
        Tip: leave lock amount empty to add entire allowance to available balance.
      </p>
    </form>
  );
}
