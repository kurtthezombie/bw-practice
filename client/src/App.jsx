import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "./authApi";
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  setToken,
} from "./store";

function TasksApp() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.tasks);
  const [title, setTitle] = useState("");

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const result = await dispatch(createTask(trimmedTitle));
    if (createTask.fulfilled.match(result)) {
      setTitle("");
    }
  }

  return (
    <main>
      <h1>Tasks</h1>

      <form onSubmit={handleSubmit}>
        <label htmlFor="title">New task</label>{" "}
        <input
          id="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={255}
          disabled={loading}
          required
        />{" "}
        <button disabled={loading || !title.trim()}>Add</button>
      </form>

      {loading && <p role="status">Working…</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && items.length === 0 && <p>No tasks yet.</p>}

      <ul>
        {items.map((task) => (
          <li key={task.id}>
            <label>
              <input
                type="checkbox"
                checked={Boolean(task.completed)}
                disabled={loading}
                onChange={(event) =>
                  dispatch(
                    updateTask({ id: task.id, completed: event.target.checked })
                  )
                }
              />
              {task.title}
            </label>{" "}
            <button disabled={loading} onClick={() => dispatch(deleteTask(task.id))}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}

export default function App() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const [error, setError] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError("");
    setSigningIn(true);

    try {
      const token = await login(form.get("email"), form.get("password"));
      dispatch(setToken(token));
    } catch (error) {
      setError(error.message);
    } finally {
      setSigningIn(false);
    }
  }

  if (token) {
    return <TasksApp />;
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
    
  );
}