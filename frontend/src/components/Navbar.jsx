import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);

  const API_BASE =
    import.meta.env.VITE_BACKEND_URL || "https://pocketgrowth.onrender.com";

  const handleLogout = () => {
    localStorage.clear();
    if (setUser) setUser(null);
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    if (!user) {
      setPendingCount(0);
      return;
    }

    let mounted = true;

    const fetchCount = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/transactions/received/pending/${user.id}`
        );
        const data = await res.json();
        if (mounted && res.ok) setPendingCount(data.transactions.length || 0);
      } catch {}
    };

    fetchCount();
    const timer = setInterval(fetchCount, 4000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [user]);

  // Logged-out Navbar
  if (!user) {
    return (
      <nav
        style={{
          background: "#1e293b",
          color: "white",
          display: "flex",
          justifyContent: "center",
          padding: "1rem 0",
          borderBottom: "2px solid #334155",
        }}
      >
        <h2 style={{ fontWeight: 700, fontSize: "1.4rem", color: "#22c55e" }}>
          💰 PocketGrowth
        </h2>
      </nav>
    );
  }

  // Logged-in Navbar
  return (
    <nav
      style={{
        background: "#1e293b",
        color: "white",
        padding: "0.8rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "2px solid #334155",
      }}
    >
      <h1 style={{ fontWeight: 700, fontSize: "1.6rem", color: "#22c55e" }}>
        💰 PocketGrowth
      </h1>

      <div style={{ display: "flex", gap: "1.2rem", alignItems: "center" }}>
        <NavLink to="/dashboard" label="Dashboard" />
        <NavLink to="/send" label="Send Money" />
        <NavLink
          to="/receive"
          label={`Received ${pendingCount > 0 ? `(${pendingCount})` : ""}`}
        />
        <NavLink to="/transactions" label="Transactions" />
        <NavLink to="/investments" label="Investments" />
        <NavLink to="/profile" label="Profile" />

        <button
          onClick={handleLogout}
          style={{
            background: "#ef4444",
            padding: "8px 14px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            color: "white",
            fontWeight: 500,
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

function NavLink({ to, label }) {
  return (
    <Link
      to={to}
      style={{
        textDecoration: "none",
        color: "white",
        fontWeight: 500,
      }}
    >
      {label}
    </Link>
  );
}
