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
      const res = await fetch(`https://pocketgrowth.onrender.com/api/transactions/user/${user.id}`);
      const data = await res.json();

      if (res.ok) setList(data.transactions);
      else setMessage(data.error || "Failed to load transactions");
    } catch {
      setMessage("Network error");
    }
  };

  const renderRow = (tx) => {
    // normalize date
    const when = new Date(tx.createdAt).toLocaleString();
    const amt = tx.amount ?? tx.originalAmount ?? 0;

    switch (tx.type) {
      case "send":
        return (
          <div>
            <strong>Sent</strong> — {formatINR(amt)} to {tx.toUserName || tx.toUserEmail}
            <div style={{ color: "#94a3b8", fontSize: ".9rem" }}>{when}</div>
          </div>
        );
      case "receive":
        return (
          <div>
            <strong>Received</strong> — {formatINR(amt)} from {tx.fromUserName || "Unknown"}
            <div style={{ color: "#94a3b8", fontSize: ".9rem" }}>{when}</div>
          </div>
        );
      case "allowance":
        return (
          <div>
            <strong>Allowance</strong> — {formatINR(amt)}
            <div style={{ color: "#94a3b8", fontSize: ".9rem" }}>{when}</div>
          </div>
        );
      case "lock_add":
        return (
          <div>
            <strong>Locked Savings</strong> — {formatINR(amt)} added to locked savings
            <div style={{ color: "#94a3b8", fontSize: ".9rem" }}>{when}</div>
          </div>
        );
      case "unlock":
        return (
          <div>
            <strong>Unlocked</strong> — {formatINR(amt)} {tx.note ? `for "${tx.note}"` : ""}
            <div style={{ color: "#94a3b8", fontSize: ".9rem" }}>{when}</div>
          </div>
        );
      case "invest":
        return (
          <div>
            <strong>Invested</strong> — {formatINR(amt)} {tx.note ? `(${tx.note})` : ""}
            <div style={{ color: "#94a3b8", fontSize: ".9rem" }}>{when}</div>
          </div>
        );
      case "growth":
        return (
          <div>
            <strong>Investment Growth</strong> — {formatINR(amt)}
            <div style={{ color: "#94a3b8", fontSize: ".9rem" }}>{when}</div>
          </div>
        );
      default:
        return (
          <div>
            <strong>{tx.type}</strong> — {formatINR(amt)}
            <div style={{ color: "#94a3b8", fontSize: ".9rem" }}>{when}</div>
          </div>
        );
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "auto" }}>
      <h2>📜 Activity / Transactions</h2>

      {list.length === 0 ? (
        <p style={{ marginTop: "1rem" }}>No activity yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem" }}>
          {list.map((tx) => (
            <li
              key={tx._id}
              style={{
                marginBottom: "12px",
                background: "white",
                padding: "1rem",
                borderRadius: "10px",
                boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
              }}
            >
              {renderRow(tx)}
            </li>
          ))}
        </ul>
      )}

      <p style={{ marginTop: "10px", color: "#64748b" }}>{message}</p>
    </div>
  );
}
