import { useState } from "react";
import { login } from "../authApi";
import { setToken } from "../store";
import { useDispatch } from "react-redux";

export default function LoginForm() {
  const [error, setError] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const dispatch = useDispatch();

  async function handleLogin(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError("");
    setSigningIn(true);

    try {
      const token = await login(form.get("email"), form.get("password"));
      sessionStorage.setItem("authToken", token);
      dispatch(setToken(token));
    } catch (error) {
      setError(error.message);
    } finally {
      setSigningIn(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-blue-100 px-4 py-8 text-slate-900">
      <form onSubmit={handleLogin} className="flex w-full max-w-sm flex-col gap-4 rounded-lg bg-blue-50 p-8 shadow-lg">
        <label>
          Email
          <input name="email" type="email" autoComplete="username" required className="block w-full rounded-md bg-white px-3 py-2 text-sm text-slate-900 outline-1 -outline-offset-1 outline-slate-300 placeholder:text-slate-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"/>
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="block w-full rounded-md bg-white px-3 py-2 text-sm text-slate-900 outline-1 -outline-offset-1 outline-slate-300 placeholder:text-slate-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
          />
        </label>
        <button type="submit" disabled={signingIn} className="rounded-full bg-blue-300 p-2">
          {signingIn ? "Signing in…" : "Sign in"}
        </button>
        {error && <p role="alert">{error}</p>}
      </form>
    </div>
  )
}