import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Signup({ setUser }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("⏳ Creating account...");

    try {
      const res = await fetch("https://pocketgrowth.onrender.com/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        // persist and lift state immediately
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        if (setUser) setUser(data.user);

        // go straight to dashboard
        navigate("/dashboard", { replace: true });
      } else {
        setMessage(`❌ ${data.error || "Signup failed"}`);
      }
    } catch {
      setMessage("❌ Network error");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "80vh",
        color: "#1e293b",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          width: "320px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h2 style={{ textAlign: "center", color: "#22c55e", marginBottom: "1rem" }}>
          Create your account
        </h2>

        <input
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          style={{ margin: "8px 0", padding: "10px" }}
          required
        />

        <input
          name="email"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={handleChange}
          style={{ margin: "8px 0", padding: "10px" }}
          required
        />

        <input
          name="password"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={handleChange}
          style={{ margin: "8px 0", padding: "10px" }}
          required
        />

        <button
          type="submit"
          style={{
            background: "#22c55e",
            color: "white",
            border: "none",
            padding: "10px",
            borderRadius: "5px",
            cursor: "pointer",
            marginTop: "10px",
          }}
        >
          Sign Up
        </button>

        <p style={{ marginTop: "10px", textAlign: "center" }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>

        <p style={{ marginTop: "10px", color: "#64748b" }}>{message}</p>
      </form>
    </div>
  );
}
