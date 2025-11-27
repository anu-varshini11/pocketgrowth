import { useState } from "react";

export default function UnlockForm({ user, refreshUserData }) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");

  const handleUnlock = async (e) => {
    e.preventDefault();
    setMessage("⏳ Processing...");
    try {
      const res = await fetch("http://localhost:5000/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, amount, reason }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || "✅ Unlocked");
        setAmount("");
        setReason("");
        if (refreshUserData) await refreshUserData();
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch {
      setMessage("❌ Unlock failed");
    }
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <h3>Unlock Savings</h3>
      <form onSubmit={handleUnlock}>
        <input
          type="number"
          placeholder="Amount (₹)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          style={{ padding: "8px", marginRight: "10px" }}
        />
        <input
          type="text"
          placeholder="Reason (optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          style={{ padding: "8px", marginRight: "10px" }}
        />
        <button
          type="submit"
          style={{
            background: "#2196F3",
            color: "white",
            border: "none",
            padding: "8px 12px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Unlock
        </button>
      </form>
      <p>{message}</p>
    </div>
  );
}
