import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard  from "./pages/Dashboard";
import Leaves from "./pages/Leaves";
import Teams from "./pages/Teams"
import TeamDetails from "./pages/TeamDetails";
import Attendance from "./pages/Attendance";
import socket from "./socket";

import Employees from "./pages/Employees";
import Profile from "./pages/Profile"

/* ============================
   Auth Helpers (temporary)
============================ */
const getStoredUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

const isAuthenticated = () => {
  return !!localStorage.getItem("user");
};

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  return children;
}

/* ============================
   App Component
============================ */
function App() {
  const [user, setUser] = useState(getStoredUser());

  // 🔔 Join socket room once user is available
  useEffect(() => {
    if (user?._id) {
      socket.emit("join", user._id);
    }
  }, [user]);

  return (
    <BrowserRouter>
    

      <Routes>
        
        <Route path="/login" element={<Login setUser={setUser} />} />

        <Route
          path="/login"
          element={<Login setUser={setUser} />}
        />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element ={ 
          <Dashboard /> }
          
          />


          <Route
  path ="/employees"
  element={
    
      <Employees />
    
  }
/>

 <Route
  path ="/leaves"
  element={
    
      <Leaves />
    
  }
/>

 <Route
  path ="/profile"
  element={
    
      <Profile />
    
  }
/>

 <Route
  path ="/teams"
  element={
    
      <Teams />
    
  }
/>

        <Route path="/teams/:teamId" element={<TeamDetails />} />

          <Route path="attendance" element={<Attendance />} />


       
      </Routes>
    </BrowserRouter>
  );
}

export default App;
