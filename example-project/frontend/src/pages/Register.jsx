import { useState } from "react";
import Button from "../components/Button.jsx";
import Input from "../components/Input.jsx";
import { login, register } from "../services/authApi.js";

export default function Register({ onLoggedIn, onShowLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    try {
      await register({ email, password });
      // Log in straight away so the new user lands on their notes.
      const user = await login({ email, password });
      onLoggedIn(user);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="auth-page">
      <h1>Create an account</h1>
      <form onSubmit={handleSubmit}>
        <Input
          id="register-email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <Input
          id="register-password"
          label="Password (at least 8 characters)"
          type="password"
          autoComplete="new-password"
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <Button type="submit">Register</Button>
      </form>
      <p>
        Already have an account?{" "}
        <Button type="button" variant="link" onClick={onShowLogin}>
          Log in
        </Button>
      </p>
    </main>
  );
}
