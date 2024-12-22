// src/pages/Read.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';

// Styled Components (기존 코드 유지)
const Wrapper = styled.div`
  width: 80%;
  margin: 40px auto;
  padding: 20px;
  background: #f0f0f0; /* 기존 #fff에서 #f0f0f0으로 변경 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-family: Arial, sans-serif;
`;

const Title = styled.h1`
  font-size: 28px;
  margin-bottom: 10px;
`;

const Tags = styled.p`
  font-size: 14px;
  color: #777;
  margin-bottom: 20px;
`;

const Content = styled.div`
  font-size: 16px;
  line-height: 1.6;
  /* 긴 단어 자동 줄바꿈을 위한 CSS 속성 추가 */
  word-break: break-word;
  overflow-wrap: break-word;

  /* 이미지 리사이징을 위한 스타일 추가 */
  img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 10px 0;
  }
`;

const BackButton = styled.button`
  padding: 8px 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 20px;
  
  &:hover {
    background-color: #0056b3;
  }
`;

function Read({ isLoggedIn }) {
  const { id } = useParams(); // 라우트 파라미터에서 포스트 ID 가져오기
  const [post, setPost] = useState(null);
  const navigate = useNavigate();

  // 환경 변수에서 API 기본 URL 가져오기
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/posts/${id}`);
      setPost(response.data.post);
    } catch (error) {
      console.error('포스트 조회 오류:', error);
      alert('포스트를 불러오는 중 오류가 발생했습니다.');
      navigate('/'); // 오류 발생 시 홈으로 이동
    }
  };

  if (!post) {
    return <Wrapper>로딩 중...</Wrapper>;
  }

  return (
    <Wrapper>
      <Title>제목: {post.title}</Title>
      <Tags>요약: {post.tags || '없음'}</Tags>
      <Content
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(post.content),
        }}
      />
      <BackButton onClick={() => navigate(-1)}>뒤로 가기</BackButton>
    </Wrapper>
  );
}

export default Read;
