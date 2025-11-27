import { useState } from "react";

export default function InvestmentForm({ user, refreshUserData }) {
  const [type, setType] = useState("stocks");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const API_BASE =
    import.meta.env.VITE_BACKEND_URL || "https://pocketgrowth.onrender.com";

  const handleInvest = async (e) => {
    e.preventDefault();
    setMessage("⏳ Processing investment...");

    try {
      const res = await fetch(`${API_BASE}/api/investments/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, type, amount }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setAmount("");
        refreshUserData();
      } else {
        setMessage(`❌ ${data.error || "Investment failed"}`);
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Network error");
    }
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <h3>📈 Make an Investment</h3>
      <form onSubmit={handleInvest}>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{ padding: "8px", marginRight: "10px" }}
        >
          <option value="stocks">Stocks</option>
          <option value="crypto">Crypto</option>
          <option value="mutualfunds">Mutual Funds</option>
        </select>

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
            background: "#FF9800",
            color: "white",
            border: "none",
            padding: "8px 12px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Invest
        </button>
      </form>
      <p>{message}</p>
    </div>
  );
}
