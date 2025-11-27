import { useState } from "react";

export default function Profile() {
  const stored = JSON.parse(localStorage.getItem("user"));
  const [form, setForm] = useState({
    name: stored.name,
    email: stored.email,
    savingsPercent: stored.savingsPercent || 20,
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const [message, setMessage] = useState("");
  const [passMessage, setPassMessage] = useState("");

  // ------------------------------
  // Update profile info
  // ------------------------------
  const updateInfo = async (e) => {
    e.preventDefault();
    setMessage("Updating...");

    const res = await fetch("https://pocketgrowth.onrender.com/api/profile/update-info", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: stored.id, ...form }),
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("user", JSON.stringify(data.user));
      setMessage("✔ Profile updated!");
    } else {
      setMessage("❌ " + data.error);
    }
  };

  // ------------------------------
  // Update savings %
  // ------------------------------
  const updatePercent = async (e) => {
    e.preventDefault();
    const res = await fetch("https://pocketgrowth.onrender.com/api/profile/update-savings-percent", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: stored.id, percent: form.savingsPercent }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("✔ Savings percentage updated");
    } else {
      setMessage("❌ " + data.error);
    }
  };

  // ------------------------------
  // Update password
  // ------------------------------
  const updatePassword = async (e) => {
    e.preventDefault();
    setPassMessage("Updating...");

    const res = await fetch("https://pocketgrowth.onrender.com/api/profile/update-password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: stored.id,
        ...passwordForm,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setPassMessage("✔ Password updated!");
      setPasswordForm({ oldPassword: "", newPassword: "" });
    } else {
      setPassMessage("❌ " + data.error);
    }
  };

  // ------------------------------
  // Delete account
  // ------------------------------
  const deleteAccount = async () => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;

    const res = await fetch(
      `https://pocketgrowth.onrender.com/api/profile/delete/${stored.id}`,
      { method: "DELETE" }
    );

    const data = await res.json();

    if (res.ok) {
      alert("Account deleted.");
      localStorage.clear();
      window.location.href = "/login";
    } else {
      alert("Error: " + data.error);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "auto" }}>
      <h2>👤 Profile Settings</h2>

      {/* Update name & email */}
      <form onSubmit={updateInfo} style={{ marginTop: "1rem" }}>
        <h3>Update Profile Info</h3>

        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Full Name"
          style={{ width: "100%", margin: "8px 0", padding: "10px" }}
        />

        <input
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email"
          style={{ width: "100%", margin: "8px 0", padding: "10px" }}
        />

        <button
          style={{
            padding: "10px",
            background: "#22c55e",
            color: "white",
            borderRadius: "6px",
            border: "none",
          }}
        >
          Save Changes
        </button>

        <p style={{ marginTop: "10px", color: "#64748b" }}>{message}</p>
      </form>

      {/* Update Savings % */}
      <form onSubmit={updatePercent} style={{ marginTop: "2rem" }}>
        <h3>Savings Percentage (%)</h3>

        <input
          type="number"
          min="0"
          max="100"
          value={form.savingsPercent}
          onChange={(e) => setForm({ ...form, savingsPercent: e.target.value })}
          style={{ width: "100%", margin: "8px 0", padding: "10px" }}
        />

        <button
          style={{
            padding: "10px",
            background: "#0ea5e9",
            color: "white",
            borderRadius: "6px",
            border: "none",
          }}
        >
          Update
        </button>
      </form>

      {/* Password Change */}
      <form onSubmit={updatePassword} style={{ marginTop: "2rem" }}>
        <h3>Change Password</h3>

        <input
          type="password"
          placeholder="Old Password"
          value={passwordForm.oldPassword}
          onChange={(e) =>
            setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
          }
          style={{ width: "100%", margin: "8px 0", padding: "10px" }}
        />

        <input
          type="password"
          placeholder="New Password"
          value={passwordForm.newPassword}
          onChange={(e) =>
            setPasswordForm({ ...passwordForm, newPassword: e.target.value })
          }
          style={{ width: "100%", margin: "8px 0", padding: "10px" }}
        />

        <button
          style={{
            padding: "10px",
            background: "#f97316",
            color: "white",
            borderRadius: "6px",
            border: "none",
          }}
        >
          Update Password
        </button>

        <p style={{ marginTop: "10px", color: "#64748b" }}>{passMessage}</p>
      </form>

      {/* Delete Account */}
      <div style={{ marginTop: "2rem" }}>
        <button
          onClick={deleteAccount}
          style={{
            padding: "10px",
            background: "#ef4444",
            color: "white",
            borderRadius: "6px",
            border: "none",
            width: "100%",
            fontWeight: 600,
          }}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
