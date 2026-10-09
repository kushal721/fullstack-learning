import { useState } from "react";
import Button from "../components/Button.jsx";
import Input from "../components/Input.jsx";
import { login } from "../services/authApi.js";

export default function Login({ onLoggedIn, onShowRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    try {
      // On success the API also sets the login cookie in the browser.
      const user = await login({ email, password });
      onLoggedIn(user);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="auth-page">
      <h1>Log in</h1>
      <form onSubmit={handleSubmit}>
        <Input
          id="login-email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <Input
          id="login-password"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <Button type="submit">Log in</Button>
      </form>
      <p>
        No account yet?{" "}
        <Button type="button" variant="link" onClick={onShowRegister}>
          Register
        </Button>
      </p>
    </main>
  );
}
