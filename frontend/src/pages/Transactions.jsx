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

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "auto" }}>
      <h2>📜 Transaction History</h2>

      {list.length === 0 ? (
        <p style={{ marginTop: "1rem" }}>No transactions yet.</p>
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
              <p>
                <strong>{tx.type.toUpperCase()}</strong> — {formatINR(tx.amount)}
              </p>

              <p style={{ fontSize: "0.9rem", color: "#64748b" }}>
                From: {tx.fromUserName || "—"}  
                <br />
                To: {tx.toUserName || "—"}
              </p>

              <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                {new Date(tx.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}

      <p style={{ marginTop: "10px", color: "#64748b" }}>{message}</p>
    </div>
  );
}
