import { useEffect, useState } from "react";
import { formatINR } from "../utils/currency";

export default function ReceiveMoney() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [pending, setPending] = useState([]);
  const [message, setMessage] = useState("");
  const DEFAULT_PCT = 10; // default saving percent

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await fetch(`https://pocketgrowth.onrender.com/api/transactions/received/pending/${user.id}`);
      const data = await res.json();
      if (res.ok) setPending(data.transactions);
      else setMessage(data.error || "Failed to load pending");
    } catch {
      setMessage("Network error");
    }
  };

  const process = async (txId, mode, value) => {
    setMessage("⏳ Processing...");
    try {
      const body = { transactionId: txId, mode };
      if (mode === "percentage") body.percentage = value;
      if (mode === "custom") body.customAmount = value;

      const res = await fetch("https://pocketgrowth.onrender.com/api/transactions/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        // refresh pending & update local user data
        await fetchPending();
        const refreshed = await fetch(`https://pocketgrowth.onrender.com/api/auth/user/${user.id}`);
        const updatedUser = await refreshed.json();
        if (refreshed.ok) localStorage.setItem("user", JSON.stringify(updatedUser));
      } else {
        setMessage(data.error || "Processing failed");
      }
    } catch (err) {
      setMessage("Network error");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "auto" }}>
      <h2>📥 Pending Received Money</h2>
      {pending.length === 0 ? (
        <p style={{ marginTop: "1rem" }}>No pending incoming transactions.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {pending.map((tx) => (
            <li key={tx._id} style={{ marginBottom: "12px" }}>
              <div style={{
                background: "white",
                padding: "1rem",
                borderRadius: "10px",
                boxShadow: "0 1px 6px rgba(0,0,0,0.08)"
              }}>
                <p><strong>{tx.fromUserName}</strong> sent you <strong>{formatINR(tx.amount)}</strong></p>
                <p style={{ color: "#64748b", fontSize: "0.9rem" }}>{new Date(tx.createdAt).toLocaleString()}</p>

                <div style={{ marginTop: "8px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => process(tx._id, "full")}
                    style={{ background: "#0ea5a4", color: "white", border: "none", padding: "8px 10px", borderRadius: "6px", cursor: "pointer" }}
                  >
                    Add full {formatINR(tx.amount)}
                  </button>

                  <button
                    onClick={() => process(tx._id, "percentage", DEFAULT_PCT)}
                    style={{ background: "#22c55e", color: "white", border: "none", padding: "8px 10px", borderRadius: "6px", cursor: "pointer" }}
                  >
                    Save {DEFAULT_PCT}% ({formatINR(((tx.amount * DEFAULT_PCT) / 100).toFixed(2))})
                  </button>

                  <CustomSave tx={tx} onProcess={process} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p style={{ marginTop: "12px", color: "#64748b" }}>{message}</p>
    </div>
  );
}

function CustomSave({ tx, onProcess }) {
  const [val, setVal] = useState("");

  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
      <input
        type="number"
        placeholder="Custom ₹"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        style={{ padding: "6px", borderRadius: "6px", width: "90px" }}
      />
      <button
        onClick={() => {
          if (!val || isNaN(val) || Number(val) < 0 || Number(val) > tx.amount) {
            alert("Enter a valid amount (<= received amount)");
            return;
          }
          onProcess(tx._id, "custom", Number(val));
        }}
        style={{ background: "#f59e0b", color: "white", border: "none", padding: "8px 10px", borderRadius: "6px", cursor: "pointer" }}
      >
        Save custom
      </button>
    </div>
  );
}
