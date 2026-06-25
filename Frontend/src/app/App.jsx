import "./index.css";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "../context/ThemeContext";
import { router } from "./app.routes";
import { useAuth } from "../features/auth/hooks/useAuth.js";
import { useEffect } from "react";
import Protected from "../features/auth/components/Protected.jsx";

useAuth

function App() {

  const auth = useAuth();

  /* 
  @description -> This is a hydration process......
  */
  useEffect(() => {
    auth.handleGetMe();
  }, [])
  
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
