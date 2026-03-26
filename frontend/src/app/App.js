import React from 'react'

import { Routes, Route } from 'react-router-dom';
import Auth from '../pages/LogIn';
import SignUp from '../pages/SignUp';
import Dashboard from '../pages/Dashboard';


function App() {
  return (
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App