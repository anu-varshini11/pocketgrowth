import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login({ setUser }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("⏳ Logging in...");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
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

        // redirect right away
        navigate("/dashboard", { replace: true });
      } else {
        setMessage(`❌ ${data.error || "Login failed"}`);
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
          Login to your account
        </h2>

        <input
          name="email"
          placeholder="Email"
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
          Login
        </button>

        <p style={{ marginTop: "10px", textAlign: "center" }}>
          New here? <Link to="/signup">Sign Up</Link>
        </p>

        <p style={{ marginTop: "10px", color: "#64748b" }}>{message}</p>
      </form>
    </div>
  );
}
