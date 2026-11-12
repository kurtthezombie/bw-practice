import { useEffect, useState } from "react";
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  setToken,
} from "../store";
import { useDispatch, useSelector } from "react-redux";

export default function TasksApp() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.tasks);
  const [title, setTitle] = useState("");
  const completedCount = items.filter((task) => task.completed).length;

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

  function handleLogout() {
    sessionStorage.removeItem("authToken");
    dispatch(setToken(null));
  }

  return (
    <main>
      

      <div className="mb-4 text-sm text-slate-500 flex flex-col justify-center items-center gap-2">
        <button onClick={handleLogout} type="button" className="rounded-md bg-red-300 p-2 self-end hover:cursor-pointer">
          Sign out
        </button>
        <h1 className="text-2xl">Tasks</h1>
        {items.length > 0 && (
          <p role="status">
            {completedCount} of {items.length} completed · {items.length - completedCount} remaining
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <label htmlFor="title" className="text-md font-medium text-slate-700 flex align-center">
            New task
          </label>
          <input
            id="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={255}
            disabled={loading}
            required
            className="rounded-md bg-white px-3 py-2 text-sm text-slate-900 outline-1 -outline-offset-1 outline-slate-300 placeholder:text-slate-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
          />{" "}
          <button disabled={loading || !title.trim()} className="rounded-md bg-blue-300 p-2">
            Add
          </button>
        </form>
        {loading && <p role="status">Working…</p>}
        {error && <p role="alert">{error}</p>}
        {!loading && !error && items.length === 0 && <p>No tasks yet.</p>}

        <ul className="space-y-2">
          {items.map((task) => (
            <li
              key={task.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
            >
              <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  className="size-4 shrink-0 accent-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed"
                  checked={Boolean(task.completed)}
                  disabled={loading}
                  onChange={(event) =>
                    dispatch(
                      updateTask({ id: task.id, completed: event.target.checked })
                    )
                  }
                />
                <span
                  className={`min-w-0 wrap-anywhere text-sm ${
                    task.completed ? "text-slate-500 line-through" : "text-slate-900"
                  }`}
                >
                  {task.title}
                </span>
              </label>

              <button
                type="button"
                className="shrink-0 rounded-md px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading}
                onClick={() => dispatch(deleteTask(task.id))}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>

      </div>     
    </main>
  );
}
