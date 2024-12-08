// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Write from './pages/Write';
import Login from './pages/Login';
import PrivateRoute from './pages/PrivateRoute';
import Read from './pages/Read'; // Read.js import

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home isLoggedIn={isLoggedIn} />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route
          path="/write"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <Write />
            </PrivateRoute>
          }
        />
        <Route path="/read/:id" element={<Read isLoggedIn={isLoggedIn} />} /> {/* 새로운 라우트 추가 */}
      </Routes>
    </Router>
  );
}

export default App;
