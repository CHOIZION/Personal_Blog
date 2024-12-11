// src/pages/Login.js
import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Wrapper = styled.div`
  width: 100%;
  height: 100vh;
  font-family: Arial, sans-serif;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fafafa;
`;

const LoginBox = styled.div`
  width: 300px;
  padding: 30px;
  background: #ffffff;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-sizing: border-box;
`;

const Title = styled.h2`
  margin: 0 0 20px;
  font-size: 22px;
  text-align: center;
`;

const Input = styled.input`
  width: 100%;
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #ddd;
  box-sizing: border-box;
  border-radius: 3px;
  font-size: 14px;
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  background: #333;
  color: #fff;
  border: none;
  border-radius: 3px;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background: #555;
  }
`;

function Login({ setIsLoggedIn }) {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/login', formData, {
        withCredentials: true, // 쿠키를 포함하여 요청
      });

      if (response.status === 200) {
        setIsLoggedIn(true);
        alert('로그인 성공');
        navigate('/'); 
      }
    } catch (error) {
      if (error.response) {
        alert(error.response.data.message);
      } else {
        console.error('로그인 요청 실패:', error);
        alert('서버와 연결할 수 없습니다.');
      }
    }
  };

  return (
    <Wrapper>
      <LoginBox>
        <Title>Login</Title>
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            name="username"
            placeholder="ID"
            value={formData.username}
            onChange={handleChange}
          />
          <Input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          <Button type="submit">로그인</Button>
        </form>
      </LoginBox>
    </Wrapper>
  );
}

export default Login;
