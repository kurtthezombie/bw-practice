import { useSelector } from "react-redux";
import TasksApp from "./components/TasksApp";
import LoginForm from "./components/LoginForm";

export default function App() {
  const token = useSelector((state) => state.auth.token);

  return token ? <TasksApp /> : <LoginForm />;
}