// frontend/src/pages/Profile.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatINR } from "../utils/currency";

export default function Profile() {
  const navigate = useNavigate();
  const stored = JSON.parse(localStorage.getItem("user"));
  const [user, setUser] = useState(stored || null);

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [savingsPercent, setSavingsPercent] = useState(user?.savingsPercent ?? 10);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user]);

  const refreshUser = async () => {
    try {
      const res = await fetch(`https://pocketgrowth.onrender.com/api/auth/user/${user.id}`);
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMsg("⏳ Updating profile...");
    try {
      const res = await fetch("https://pocketgrowth.onrender.com/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, name, email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("✅ Profile updated");
        if (data.user) {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        } else {
          await refreshUser();
        }
      } else {
        setMsg(`❌ ${data.error}`);
      }
    } catch (err) {
      setMsg("❌ Network error");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMsg("⏳ Changing password...");
    try {
      const res = await fetch("https://pocketgrowth.onrender.com/api/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, oldPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("✅ Password changed");
        setOldPassword("");
        setNewPassword("");
      } else {
        setMsg(`❌ ${data.error}`);
      }
    } catch {
      setMsg("❌ Network error");
    }
  };

  const handleSavingsPercent = async (e) => {
    e.preventDefault();
    setMsg("⏳ Updating auto-save %...");
    try {
      const res = await fetch("https://pocketgrowth.onrender.com/api/profile/savings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, savingsPercent }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("✅ Auto-save % updated");
        await refreshUser();
      } else {
        setMsg(`❌ ${data.error}`);
      }
    } catch {
      setMsg("❌ Network error");
    }
  };

  const handleDelete = async () => {
    const ok = confirm("This will permanently delete your account and data. Are you sure?");
    if (!ok) return;

    setMsg("⏳ Deleting account...");
    try {
      const res = await fetch("https://pocketgrowth.onrender.com/api/profile/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("✅ Account deleted");
        localStorage.clear();
        navigate("/signup");
      } else {
        setMsg(`❌ ${data.error}`);
      }
    } catch {
      setMsg("❌ Network error");
    }
  };

  if (!user) return null;

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "auto" }}>
      <h2>⚙️ Profile Settings</h2>

      <div style={{ marginTop: "1rem", background: "white", padding: "1.2rem", borderRadius: "10px", border: "1px solid #e5e7eb" }}>
        <h3>Account</h3>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Available:</strong> {formatINR(user.availableBalance ?? 0)}</p>
        <p><strong>Locked:</strong> {formatINR(user.lockedBalance ?? 0)}</p>
      </div>

      <form onSubmit={handleUpdateProfile} style={{ marginTop: "1rem", background: "#f8fafc", padding: "1rem", borderRadius: "10px" }}>
        <h3>Edit profile</h3>
        <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
          <input value={name} onChange={(e) => setName(e.target.value)} style={{ padding: "8px", flex: 1 }} />
          <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: "8px", flex: 1 }} />
        </div>
        <button style={{ background: "#22c55e", color: "white", padding: "8px 12px", border: "none", borderRadius: "6px" }}>Save</button>
      </form>

      <form onSubmit={handleChangePassword} style={{ marginTop: "1rem", background: "#f8fafc", padding: "1rem", borderRadius: "10px" }}>
        <h3>Change password</h3>
        <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
          <input placeholder="Old password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} type="password" style={{ padding: "8px", flex: 1 }} />
          <input placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" style={{ padding: "8px", flex: 1 }} />
        </div>
        <button style={{ background: "#1f7ed6", color: "white", padding: "8px 12px", border: "none", borderRadius: "6px" }}>Change password</button>
      </form>

      <form onSubmit={handleSavingsPercent} style={{ marginTop: "1rem", background: "#f8fafc", padding: "1rem", borderRadius: "10px" }}>
        <h3>Auto-save percentage</h3>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            type="number"
            value={savingsPercent}
            onChange={(e) => setSavingsPercent(e.target.value)}
            style={{ padding: "8px", width: "120px" }}
            min={0}
            max={100}
          />
          <span>% of incoming allowances that will be auto-saved (if you choose to use the quick auto-save flow)</span>
        </div>
        <div style={{ marginTop: "8px" }}>
          <button style={{ background: "#22c55e", color: "white", padding: "8px 12px", border: "none", borderRadius: "6px" }}>Save percent</button>
        </div>
      </form>

      <div style={{ marginTop: "1rem", background: "#fff7f7", padding: "1rem", borderRadius: "10px", border: "1px solid #ffd6d6" }}>
        <h3 style={{ color: "#b91c1c" }}>Danger zone</h3>
        <p>Deleting your account removes all investments and transaction history.</p>
        <button onClick={handleDelete} style={{ background: "#ef4444", color: "white", padding: "8px 12px", border: "none", borderRadius: "6px" }}>
          Delete my account
        </button>
      </div>

      <p style={{ marginTop: "12px", color: "#64748b" }}>{msg}</p>
    </div>
  );
}
