import Button from "./Button.jsx";

export default function Navbar({ user, onLogout }) {
  return (
    <header className="navbar">
      <span className="navbar-title">Notes</span>
      {user && (
        <nav className="navbar-user">
          <span>{user.email}</span>
          <Button variant="secondary" type="button" onClick={onLogout}>
            Log out
          </Button>
        </nav>
      )}
    </header>
  );
}
