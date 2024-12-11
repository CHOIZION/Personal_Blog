// src/pages/Logout.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

const LogoutWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
  font-family: Arial, sans-serif;
`;

const LogoutMessage = styled.h2`
  color: #333;
`;

function Logout({ setIsLoggedIn }) {
  const navigate = useNavigate();

  useEffect(() => {
    // 서버에 로그아웃 요청
    axios.post('http://localhost:5000/api/logout', {}, { withCredentials: true })
      .then(() => {
        // 로그인 상태 업데이트
        setIsLoggedIn(false);

        // 홈 페이지로 리디렉션
        navigate('/');
      })
      .catch((error) => {
        console.error('로그아웃 요청 실패:', error);
        alert('로그아웃에 실패했습니다.');
      });
  }, [navigate, setIsLoggedIn]);

  return (
    <LogoutWrapper>
      <LogoutMessage>로그아웃 중입니다...</LogoutMessage>
    </LogoutWrapper>
  );
}

export default Logout;
