import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_BACKEND_URL || "https://pocketgrowth.onrender.com";

  const handleDelete = async () => {
    setMessage("⏳ Deleting account...");
    try {
      const res = await fetch(`${API_BASE}/api/auth/user/${user.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok) {
        // clear local state and redirect to login
        localStorage.clear();
        setMessage("✅ Account deleted. Redirecting...");
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 800);
      } else {
        setMessage(`❌ ${data.error || "Delete failed"}`);
      }
    } catch {
      setMessage("❌ Network error");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "auto" }}>
      <h2>Profile</h2>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Available:</strong> ₹{(user.availableBalance ?? 0).toFixed(2)}</p>
      <p><strong>Locked:</strong> ₹{(user.lockedBalance ?? 0).toFixed(2)}</p>

      <div style={{ marginTop: "2rem" }}>
        <button
          onClick={() => setConfirming(true)}
          style={{ background: "#ef4444", color: "white", padding: "10px 14px", border: "none", borderRadius: "6px", cursor: "pointer" }}
        >
          Delete Account
        </button>
      </div>

      {confirming && (
        <div style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,0.5)"
        }}>
          <div style={{ background: "white", padding: "20px", borderRadius: "8px", width: "420px" }}>
            <h3>Are you sure?</h3>
            <p>Deleting your account is permanent. Your transaction history will remain (for audit), but your profile will be removed.</p>
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "12px" }}>
              <button onClick={() => setConfirming(false)} style={{ padding: "8px 12px", borderRadius: "6px" }}>Cancel</button>
              <button onClick={handleDelete} style={{ padding: "8px 12px", background: "#ef4444", color: "white", borderRadius: "6px" }}>
                Yes, delete
              </button>
            </div>
            <p style={{ marginTop: "10px" }}>{message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
