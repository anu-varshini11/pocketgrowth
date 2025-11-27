import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { formatINR } from "../utils/currency";

export default function Investments() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [investments, setInvestments] = useState([]);
  const [totals, setTotals] = useState({
    totalInvested: 0,
    totalReturns: 0,
    netWorth: 0,
  });

  const [type, setType] = useState("Stocks");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const COLORS = ["#22c55e", "#0ea5e9"];
  const API_BASE = "https://pocketgrowth.onrender.com/api";

  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/investments/${user.id}`);
      const data = await res.json();

      if (res.ok) {
        setInvestments(data.investments);
        setTotals({
          totalInvested: data.totalInvested,
          totalReturns: data.totalReturns,
          netWorth: data.netWorth,
        });
      }
    } catch (err) {
      console.error("Fetch investments error:", err);
    }
  };

  const addInvestment = async (e) => {
    e.preventDefault();
    setMessage("Adding...");

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setMessage("❌ Enter a valid amount");
      return;
    }
    if (Number(amount) > (user.lockedBalance || 0)) {
      setMessage("❌ Not enough locked savings to invest");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/investments/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          type,
          amount,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✔ Investment added!");
        setAmount("");

        await fetchInvestments();

        // refresh user after deduction
        const refreshed = await fetch(`${API_BASE}/auth/user/${user.id}`);
        const updatedUser = await refreshed.json();
        if (refreshed.ok) {
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (err) {
      setMessage("❌ Network error");
    }
  };

  const pieData = [
    { name: "Invested", value: totals.totalInvested },
    { name: "Returns", value: totals.totalReturns },
  ];

  // FIX: unique dates + cumulative net worth
  const lineData = investments
    .slice()
    .reverse()
    .map((inv, index) => ({
      index,
      netWorth: inv.amount + inv.returns,
      label: new Date(inv.createdAt).toLocaleString(),
    }));

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "auto" }}>
      <h2 style={{ marginBottom: "1.5rem" }}>📈 Investments Dashboard</h2>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        <Card title="Total Invested" value={formatINR(totals.totalInvested)} />
        <Card title="Total Returns" value={formatINR(totals.totalReturns)} />
        <Card title="Net Worth" value={formatINR(totals.netWorth)} />
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ height: "320px", background: "white", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
          <h3>Investment Breakdown</h3>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label>
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ height: "320px", background: "white", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
          <h3>Net Worth Growth</h3>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <XAxis dataKey="index" tickFormatter={(i) => `#${i + 1}`} />
                <YAxis />
                <Tooltip labelFormatter={(i) => lineData[i]?.label} />
                <Line type="monotone" dataKey="netWorth" stroke="#22c55e" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Add Investment */}
      <div style={{ padding: "1.5rem", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
        <h3>Add New Investment</h3>

        <p style={{ marginTop: "0.5rem", marginBottom: "1rem", color: "#64748b" }}>
          Locked Savings Available:&nbsp;
          <strong style={{ color: "#22c55e" }}>{formatINR(user.lockedBalance ?? 0)}</strong>
        </p>

        <form onSubmit={addInvestment} style={{ marginTop: "1rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <label>Type:</label>
            <select value={type} onChange={(e) => setType(e.target.value)} style={{ marginLeft: "10px", padding: "6px", borderRadius: "6px", border: "1px solid #94a3b8" }}>
              <option>Stocks</option>
              <option>Crypto</option>
              <option>SIP</option>
              <option>Mutual Fund</option>
              <option>Fixed Deposit</option>
            </select>
          </div>

          <input
            type="number"
            placeholder="Amount (₹)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            style={{ padding: "10px", width: "200px", borderRadius: "6px", border: "1px solid #94a3b8" }}
          />

          <button type="submit" style={{ marginLeft: "10px", padding: "10px", background: "#22c55e", color: "white", borderRadius: "6px", border: "none", cursor: "pointer" }}>
            Add
          </button>
        </form>

        {message && <p style={{ marginTop: "10px" }}>{message}</p>}
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={{ background: "white", padding: "1rem 1.5rem", borderRadius: "10px", flex: "1", border: "1px solid #e2e8f0", minWidth: "200px", boxShadow: "0 3px 8px rgba(0,0,0,0.05)" }}>
      <p style={{ color: "#64748b", marginBottom: ".3rem" }}>{title}</p>
      <h2 style={{ fontSize: "1.6rem", color: "#1e293b" }}>{value}</h2>
    </div>
  );
}
