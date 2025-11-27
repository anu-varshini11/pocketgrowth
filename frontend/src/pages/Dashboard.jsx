import { useEffect, useState } from "react";
import AllowanceForm from "../components/AllowanceForm";
import UnlockForm from "../components/UnlockForm";
import { formatINR } from "../utils/currency";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setMessage("⚠️ No user logged in");
    }
  }, []);

  const refreshUserData = async () => {
    if (!user) return;
    try {
      const res = await fetch(`https://pocketgrowth.onrender.com/api/auth/user/${user.id}`);
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data));
        setUser(data);
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  if (!user)
    return (
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <h2>Dashboard</h2>
        <p>{message || "Loading user..."}</p>
      </div>
    );

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "900px",
        margin: "auto",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h2 style={{ fontSize: "1.8rem", fontWeight: 600, marginBottom: "1rem" }}>
        Welcome back, <span style={{ color: "#22c55e" }}>{user.name}</span> 👋
      </h2>

      {/* Wallet Summary Card */}
      <div
        style={{
          background: "white",
          padding: "1.5rem",
          borderRadius: "14px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          border: "1px solid #e5e7eb",
          marginBottom: "2rem",
        }}
      >
        <h3 style={{ marginBottom: "1rem", fontSize: "1.3rem" }}>💰 Wallet Summary</h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.2rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              background: "#f0fdf4",
              padding: "1rem",
              borderRadius: "10px",
              border: "1px solid #bbf7d0",
            }}
          >
            <p style={{ fontSize: ".9rem", color: "#166534" }}>Available Balance</p>
            <h2 style={{ marginTop: ".3rem", fontSize: "1.4rem", color: "#15803d" }}>
              {formatINR(user.availableBalance ?? 0)}
            </h2>
          </div>

          <div
            style={{
              background: "#fff7ed",
              padding: "1rem",
              borderRadius: "10px",
              border: "1px solid #fed7aa",
            }}
          >
            <p style={{ fontSize: ".9rem", color: "#c2410c" }}>Locked Savings</p>
            <h2 style={{ marginTop: ".3rem", fontSize: "1.4rem", color: "#ea580c" }}>
              {formatINR(user.lockedBalance ?? 0)}
            </h2>
          </div>
        </div>

        {/* Savings Actions */}
        <div style={{ marginTop: "1rem" }}>
          <AllowanceForm user={user} refreshUserData={refreshUserData} />
          <UnlockForm user={user} refreshUserData={refreshUserData} />
        </div>
      </div>
    </div>
  );
}
