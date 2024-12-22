// src/pages/Logout.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

// Styled Components (기존 코드 유지)
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

  // 환경 변수에서 API 기본 URL 가져오기
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    // 서버에 로그아웃 요청
    axios.post(`${API_BASE_URL}/logout`, {}, { withCredentials: true })
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
  }, [API_BASE_URL, navigate, setIsLoggedIn]);

  return (
    <LogoutWrapper>
      <LogoutMessage>로그아웃 중입니다...</LogoutMessage>
    </LogoutWrapper>
  );
}

export default Logout;
