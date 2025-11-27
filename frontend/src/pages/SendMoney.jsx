import { useState } from "react";
import { formatINR } from "../utils/currency";

export default function SendMoney() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [toEmail, setToEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = async (e) => {
    e.preventDefault();
    setMessage("⏳ Sending...");

    try {
      const res = await fetch("https://pocketgrowth.onrender.com/api/transactions/send", {
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
        setMessage(`✅ ${data.message}`);
        setToEmail("");
        setAmount("");

        // refresh stored user data for sender
        const refreshed = await fetch(`https://pocketgrowth.onrender.com/api/auth/user/${user.id}`);
        const updatedUser = await refreshed.json();
        if (refreshed.ok) localStorage.setItem("user", JSON.stringify(updatedUser));
      } else {
        setMessage(`❌ ${data.error || "Failed to send money"}`);
      }
    } catch (error) {
      setMessage("❌ Network error");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "auto" }}>
      <h2>💸 Send Money</h2>
      <form onSubmit={handleSend} style={{ marginTop: "1rem" }}>
        <input
          type="email"
          placeholder="Recipient Email"
          value={toEmail}
          onChange={(e) => setToEmail(e.target.value)}
          required
          style={{ padding: "10px", marginBottom: "10px", width: "100%" }}
        />
        <input
          type="number"
          placeholder="Amount (₹)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          style={{ padding: "10px", marginBottom: "10px", width: "100%" }}
        />
        <button
          type="submit"
          style={{
            background: "#22c55e",
            color: "white",
            border: "none",
            padding: "10px",
            borderRadius: "6px",
            width: "100%",
            cursor: "pointer",
          }}
        >
          Send Money
        </button>
      </form>
      <p style={{ marginTop: "1rem" }}>{message}</p>
    </div>
  );
}
