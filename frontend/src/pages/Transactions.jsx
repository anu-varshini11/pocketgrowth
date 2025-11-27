import { useEffect, useState } from "react";
import { formatINR } from "../utils/currency";

export default function Transactions() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [list, setList] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await fetch(
        `https://pocketgrowth.onrender.com/api/transactions/user/${user.id}`
      );
      const data = await res.json();

      if (res.ok) setList(data.transactions);
      else setMessage(data.error || "Failed to load transactions");
    } catch {
      setMessage("Network error");
    }
  };

  const colorMap = {
    send: "#ef4444",
    receive: "#22c55e",
    allowance: "#0ea5e9",
    lock_add: "#8b5cf6",
    unlock: "#fb923c",
    invest: "#facc15",
    growth: "#22c55e",
  };

  const labelMap = {
    send: "Sent Money",
    receive: "Received Money",
    allowance: "Allowance Added",
    lock_add: "Locked Savings Added",
    unlock: "Unlocked Savings",
    invest: "Investment Made",
    growth: "Investment Growth",
  };

  const description = (tx) => {
    switch (tx.type) {
      case "send":
        return `Sent ${formatINR(tx.amount)} to ${tx.toUserName}`;
      case "receive":
        return `Received ${formatINR(tx.amount)} from ${tx.fromUserName}`;
      case "allowance":
        return `Added allowance of ${formatINR(tx.amount)}`;
      case "lock_add":
        return `Locked ${formatINR(tx.amount)} from allowance`;
      case "unlock":
        return `Unlocked ${formatINR(tx.amount)} — ${tx.note || "No reason"}`;
      case "invest":
        return `Invested ${formatINR(tx.amount)} (${tx.note || tx.type})`;
      case "growth":
        return `Investment Growth — +${formatINR(tx.amount)}`;
      default:
        return tx.type;
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "auto" }}>
      <h2 style={{ marginBottom: "1rem" }}>📜 Transaction History</h2>

      {list.length === 0 ? (
        <p>No transactions yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {list.map((tx) => (
            <li
              key={tx._id}
              style={{
                background: "white",
                padding: "1rem",
                borderRadius: "10px",
                marginBottom: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong
                  style={{
                    color: colorMap[tx.type],
                    fontSize: "1.1rem",
                  }}
                >
                  {labelMap[tx.type]}
                </strong>

                <span style={{ color: "#64748b" }}>
                  {new Date(tx.createdAt).toLocaleString()}
                </span>
              </div>

              <p style={{ marginTop: "8px", fontSize: "1rem" }}>
                {description(tx)}
              </p>
            </li>
          ))}
        </ul>
      )}

      <p style={{ marginTop: "8px", color: "#64748b" }}>{message}</p>
    </div>
  );
}
