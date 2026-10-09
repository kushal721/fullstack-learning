import { useEffect, useState } from "react";
import Navbar from "./components/Navbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import { getCurrentUser, logout } from "./services/authApi.js";

// Three pages are simple enough to switch with state, so the app needs no
// router library.
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("loading");

  // On first load, ask the API whether someone is already logged in.
  useEffect(() => {
    getCurrentUser().then((current) => {
      setUser(current);
      setPage(current ? "dashboard" : "login");
    });
  }, []);

  function handleLoggedIn(loggedInUser) {
    setUser(loggedInUser);
    setPage("dashboard");
  }

  async function handleLogout() {
    await logout();
    setUser(null);
    setPage("login");
  }

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      {page === "loading" && <p className="page-message">Loading…</p>}
      {page === "login" && (
        <Login
          onLoggedIn={handleLoggedIn}
          onShowRegister={() => setPage("register")}
        />
      )}
      {page === "register" && (
        <Register
          onLoggedIn={handleLoggedIn}
          onShowLogin={() => setPage("login")}
        />
      )}
      {page === "dashboard" && <Dashboard />}
    </>
  );
}
