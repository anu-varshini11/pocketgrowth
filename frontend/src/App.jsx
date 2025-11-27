import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import SendMoney from "./pages/SendMoney";
import ReceiveMoney from "./pages/ReceiveMoney";
import Transactions from "./pages/Transactions";
import Investments from "./pages/Investments";
import Profile from "./pages/Profile";

function App() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Load user BEFORE rendering routes
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    setLoadingUser(false);
  }, []);

  if (loadingUser) {
    return <div style={{ padding: "2rem" }}>Loading...</div>;
  }

  return (
    <Router>
      <Navbar user={user} setUser={setUser} />

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <Login setUser={setUser} />}
        />

        <Route
          path="/signup"
          element={user ? <Navigate to="/dashboard" replace /> : <Signup setUser={setUser} />}
        />

        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
        <Route path="/send" element={user ? <SendMoney /> : <Navigate to="/login" replace />} />
        <Route path="/receive" element={user ? <ReceiveMoney /> : <Navigate to="/login" replace />} />
        <Route path="/transactions" element={user ? <Transactions /> : <Navigate to="/login" replace />} />
        <Route path="/investments" element={user ? <Investments /> : <Navigate to="/login" replace />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" replace />} />

        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
