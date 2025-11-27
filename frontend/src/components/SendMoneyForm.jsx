import { useState } from "react";

export default function SendMoneyForm({ user, refreshUserData }) {
  const [toEmail, setToEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const API_BASE =
    import.meta.env.VITE_BACKEND_URL || "https://pocketgrowth.onrender.com";

  const handleSend = async (e) => {
    e.preventDefault();
    setMessage("⏳ Sending money...");

    try {
      const res = await fetch(`${API_BASE}/api/transactions/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromUserId: user.id,
          toUserEmail: toEmail,
          amount,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setAmount("");
        setToEmail("");
        refreshUserData();
      } else {
        setMessage(`❌ ${data.error || "Transaction failed"}`);
      }
    } catch (error) {
      setMessage("❌ Network error");
    }
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <h3>Send Money</h3>

      <form onSubmit={handleSend}>
        <input
          type="email"
          placeholder="Recipient Email"
          value={toEmail}
          onChange={(e) => setToEmail(e.target.value)}
          required
          style={{ padding: "8px", marginRight: "10px" }}
        />

        <input
          type="number"
          placeholder="Amount (₹)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          style={{ padding: "8px", marginRight: "10px" }}
        />

        <button
          type="submit"
          style={{
            background: "#9C27B0",
            color: "white",
            border: "none",
            padding: "8px 12px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </form>

      <p>{message}</p>
    </div>
  );
}
