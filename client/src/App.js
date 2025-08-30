import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Practice from './pages/Practice';
import Quiz from './pages/Quiz';
import Tracking from "./pages/Tracking";
import Result from './pages/Result';
import Review from './pages/Review';
import Profile from "./pages/Profile";
import './styles/global.css';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/tracking" element={<Tracking />} />
        <Route path="/result" element={<Result />} />
        <Route path="/review" element={<Review />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
