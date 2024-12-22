// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Write from './pages/Write';
import Login from './pages/Login';
import PrivateRoute from './pages/PrivateRoute';
import Read from './pages/Read'; // Read.js import
import Logout from './pages/Logout'; // Logout 컴포넌트 import

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <Routes>
        {/* 홈 페이지 */}
        <Route path="/" element={<Home isLoggedIn={isLoggedIn} />} />

        {/* 로그인 페이지 */}
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />

        {/* 로그아웃 페이지 */}
        <Route
          path="/logout"
          element={<Logout setIsLoggedIn={setIsLoggedIn} />}
        />

        {/* 글쓰기 페이지 - 보호된 라우트 */}
        <Route
          path="/write"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <Write />
            </PrivateRoute>
          }
        />

        {/* 게시물 읽기 페이지 */}
        <Route path="/read/:id" element={<Read isLoggedIn={isLoggedIn} />} />
      </Routes>
    </Router>
  );
}

export default App;
