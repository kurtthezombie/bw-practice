import {
  configureStore,
  createAsyncThunk,
  createSlice,
  isPending,
  isFulfilled,
  isRejected,
} from "@reduxjs/toolkit";

const API_URL = "http://localhost:3000/tasks";

async function request(token, path = "", method = "GET", body) {
  const headers = { Authorization: `Bearer ${token}` };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error ?? `Request failed (${response.status})`);
  }

  if (response.status !== 204) {
    return response.json();
  }
}

export const fetchTasks = createAsyncThunk(
  "tasks/fetch",
  (_, { getState }) => request(getState().auth.token),
  {
    condition: (_, { getState }) => {
      const { auth, tasks } = getState();
      return Boolean(auth.token) && !tasks.loading;
    },
  }
);

export const createTask = createAsyncThunk(
  "tasks/create",
  (title, { getState }) =>
    request(getState().auth.token, "", "POST", { title })
);

export const updateTask = createAsyncThunk(
  "tasks/update",
  async ({ id, completed }, { getState }) => {
    await request(getState().auth.token, `/${id}`, "PATCH", { completed });
    return { id, completed: Number(completed) };
  }
);

export const deleteTask = createAsyncThunk(
  "tasks/delete",
  async (id, { getState }) => {
    await request(getState().auth.token, `/${id}`, "DELETE");
    return id;
  }
);

const tasksSlice = createSlice({
  name: "tasks",
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const { id, completed } = action.payload;
        const task = state.items.find((item) => item.id === id);
        if (task) task.completed = completed;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter((task) => task.id !== action.payload);
      })
      .addMatcher(isPending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(isFulfilled, (state) => {
        state.loading = false;
      })
      .addMatcher(isRejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Something went wrong";
      });
  },
});

const authSlice = createSlice({
  name: "auth",
  initialState: { token: sessionStorage.getItem("authToken") },
  reducers: {
    setToken(state, action) {
      state.token = action.payload;
    },
  },
});

export const { setToken } = authSlice.actions;

export const store = configureStore({
  reducer: {
    tasks: tasksSlice.reducer,
    auth: authSlice.reducer,
  },
});