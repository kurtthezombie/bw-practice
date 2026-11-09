import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createTask, deleteTask, fetchTasks, updateTask } from "./store.js";

export default function App() {
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