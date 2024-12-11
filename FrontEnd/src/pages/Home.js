// src/pages/Home.js
import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Styled Components (기존 코드 유지)
const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  min-height: 100vh; /* 전체 높이를 채우도록 설정 */
  padding: 20px;
  background: #f0f0f0;
  font-family: Arial, sans-serif;
  box-sizing: border-box;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #ddd;
`;

const Title = styled.h1`
  font-size: 24px;
  margin: 0;
  margin-left: 40px;
  flex-grow: 1;
`;

const RightContainer = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
  gap: 15px;
  position: relative; /* 패널의 절대 위치 기준 설정 */
`;

// 버튼 스타일을 통일하기 위해 재사용 가능한 Button 컴포넌트 생성
const Button = styled.button`
  padding: 8px 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }
`;

const DeleteCategoryButton = styled(Button)`
  background-color: #dc3545;

  &:hover {
    background-color: #c82333;
  }
`;

const AddCategoryButtonStyled = styled(Button)`
  background-color: #28a745;

  &:hover {
    background-color: #218838;
  }
`;

const LoginButton = styled.div`
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #333;

  &:hover {
    text-decoration: underline;
    color: #bbb;
  }
`;

const NameContainer = styled.div`
  display: flex;
  flex-direction: column; /* 수직 정렬로 변경 */
  align-items: flex-start; /* 왼쪽 정렬 */
  padding: 0 40px; 
  margin-top: 20px;
  box-sizing: border-box;
  gap: 10px; /* 요소들 간의 간격 조정 */

  @media (max-width: 768px) {
    padding: 0 20px;
  }
`;

const Name = styled.div`
  font-size: 16px;
  color: #333;
  white-space: nowrap;
`;

const ButtonContainerStyled = styled.div`
  display: flex;
  flex-direction: row; /* 수평 정렬로 변경 */
  gap: 10px; /* 버튼 간의 간격 조정 */
`;

// ExternalButton 정의
const ExternalButton = styled.a`
  text-decoration: none;
  font-size: 16px;
  cursor: pointer;
  color: #333;
  transition: color 0.3s ease;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: auto;
  text-align: center;

  &:hover {
    color: #bbb;
    background-color: #f0f0f0; /* 호버 시 회색빛 배경 추가 */
  }

  @media (max-width: 768px) {
    padding: 6px 10px;
    font-size: 14px;
  }
`;

const Categories = styled.div`
  margin: 30px 0;
`;

const CategoryHeader = styled.div`
  /* 버튼 기능을 제거했으므로 스타일 수정 */
  display: flex;
  align-items: center;
  margin-left: 40px;
  font-size: 18px;
  color: #333;
  
  /* CategoryTitle을 위로 올리기 위한 마진 조정 */
  margin-bottom: 20px;

  @media (max-width: 768px) {
    margin-left: 20px;
  }
`;

const CategoryTitle = styled.h2`
  font-size: 18px;
  margin: 0;
  
  /* 위로 약간 이동 */
  margin-top: -5px;
`;

const CategoryListWrapper = styled.div`
  margin-left: 40px;
  margin-top: 10px;
  
  @media (max-width: 768px) {
    margin-left: 20px;
  }
  /* max-height과 overflow 제거 */
`;

const CategoryList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 15px;
`;

const CategoryItem = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const CategoryItemHeader = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  font-size: 16px;
  color: #333;

  &:hover {
    color: #007bff;
  }

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const CategoryPostsWrapper = styled.div`
  margin-left: 20px;
  margin-top: 10px;
  overflow: hidden;
  transition: max-height 0.3s ease;
  max-height: ${(props) => (props.visible ? "1000px" : "0")};
`;

const CategoryPosts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

// 포스트 박스를 버튼처럼 보이게 하기 위한 스타일 수정
const CategoryPostItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 6px;
  background: #f9f9f9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer; /* 마우스 포인터 변경 */
  transition: background-color 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    background-color: #e6f7ff;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 768px) {
    padding: 10px;
    flex-direction: column;
    align-items: flex-start;
  }
`;

const PostInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const CategoryPostTitle = styled.h4`
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 5px 0;
`;

const CategoryPostTags = styled.p`
  font-size: 12px;
  color: #777;
  margin: 0 0 3px 0;
`;

const CategoryPostDate = styled.p`
  font-size: 10px;
  color: #999;
  margin: 0;
`;

const DeletePostButton = styled.button`
  padding: 4px 8px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #c82333;
  }
`;

// 새로운 ButtonWrapper 추가
const ButtonWrapper = styled.div`
  position: relative;
`;

// 슬라이드 패널 스타일
const AddCategoryPanel = styled.div`
  position: absolute; /* 절대 위치 설정 */
  top: 50px; /* 버튼 높이에 맞게 조정 */
  left: 0; /* 버튼의 왼쪽에 정렬 */
  width: 250px;
  padding: 20px;
  border: 1px solid #ddd;
  background: #f9f9f9;
  border-radius: 4px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.3s ease;
  max-height: ${(props) => (props.visible ? "300px" : "0")};
  opacity: ${(props) => (props.visible ? "1" : "0")};
  z-index: 10; /* 다른 요소보다 위에 표시 */
`;

const DeleteCategoryPanel = styled.div`
  position: absolute; /* 절대 위치 설정 */
  top: 50px; /* 버튼 높이에 맞게 조정 */
  left: 0; /* 버튼의 왼쪽에 정렬 */
  width: 250px;
  padding: 20px;
  border: 1px solid #ddd;
  background: #fff3f3;
  border-radius: 4px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.3s ease;
  max-height: ${(props) => (props.visible ? "400px" : "0")};
  opacity: ${(props) => (props.visible ? "1" : "0")};
  z-index: 10; /* 다른 요소보다 위에 표시 */
`;

const AddCategoryTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #333;
`;

const DeleteCategoryTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #333;
`;

const AddCategoryInput = styled.input`
  width: 100%;
  padding: 8px;
  font-size: 14px;
  box-sizing: border-box;
  margin-bottom: 10px;
`;

const AddCategoryButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const ConfirmButton = styled.button`
  padding: 8px 12px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #218838;
  }
`;

const CancelButton = styled.button`
  padding: 8px 12px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #c82333;
  }
`;

// 삭제 패널 내부의 카테고리 리스트 스타일
const DeleteCategoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const DeleteCategoryItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 16px;
  color: #333;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #dc3545;
    text-decoration: underline;
  }
`;

// 📌 추가된 스타일 컴포넌트
const MainContent = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 20px;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

// 서버에서 불러온 것을 보여주기 위한 컴포넌트
function Home({ isLoggedIn }) {
  const [postCount, setPostCount] = useState(0); // 전체 게시물 수
  const [categories, setCategories] = useState([]); // 카테고리 목록 (객체 형태: {id, name})
  const [openPanel, setOpenPanel] = useState(null); // 'add', 'delete', 또는 null
  const [newCategory, setNewCategory] = useState(""); // 새 카테고리 이름

  // 📌 추가된 상태 변수
  const [posts, setPosts] = useState([]); // 게시물 목록
  const [expandedCategories, setExpandedCategories] = useState({}); // 각 카테고리의 확장 상태

  const navigate = useNavigate();

  const listRef = useRef(null);

  const addButtonRef = useRef(null);
  const deleteButtonRef = useRef(null);
  const addPanelRef = useRef(null);
  const deletePanelRef = useRef(null);

  // 컴포넌트 마운트 시 카테고리 데이터 가져오기
  useEffect(() => {
    fetchCategories();
    fetchPosts(); // 📌 게시물 데이터 가져오기
  }, []);

  // 카테고리 조회 함수
  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/categories');
      setCategories(response.data.categories); // 객체 형태로 설정
    } catch (error) {
      console.error('카테고리 가져오기 오류:', error);
      alert('카테고리를 가져오는 중 오류가 발생했습니다.');
    }
  };

  // 📌 게시물 조회 함수
  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/posts');
      setPosts(response.data.posts);
      setPostCount(response.data.posts.length); // 게시물 수로 설정
    } catch (error) {
      console.error('게시물 가져오기 오류:', error);
      alert('게시물을 가져오는 중 오류가 발생했습니다.');
    }
  };

  // 패널 토글 함수
  const togglePanel = (panel) => {
    setOpenPanel((prev) => (prev === panel ? null : panel));
  };

  // 패널 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        openPanel === 'add' &&
        addPanelRef.current &&
        !addPanelRef.current.contains(event.target) &&
        addButtonRef.current &&
        !addButtonRef.current.contains(event.target)
      ) {
        setOpenPanel(null);
      }
      if (
        openPanel === 'delete' &&
        deletePanelRef.current &&
        !deletePanelRef.current.contains(event.target) &&
        deleteButtonRef.current &&
        !deleteButtonRef.current.contains(event.target)
      ) {
        setOpenPanel(null);
      }
    };

    if (openPanel !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openPanel]);

  // 카테고리 추가 확인 함수
  const handleAddCategory = async () => {
    const trimmedCategory = newCategory.trim();
    if (trimmedCategory === "") {
      alert("카테고리 이름을 입력하세요.");
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/categories', { name: trimmedCategory });
      console.log('카테고리 추가 성공:', response.data);
      setCategories([...categories, response.data.category]); // 객체 형태로 추가
      setNewCategory("");
      setOpenPanel(null);
    } catch (error) {
      if (error.response && error.response.status === 409) {
        alert("이미 존재하는 카테고리입니다.");
      } else {
        console.error('카테고리 추가 오류:', error);
        alert("카테고리를 추가하는 중 오류가 발생했습니다.");
      }
    }
  };

  // 카테고리 추가 취소 함수
  const handleCancelAddCategory = () => {
    setNewCategory("");
    setOpenPanel(null);
  };

  // **카테고리 삭제 함수 추가**
  const handleDeleteCategory = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/categories/${id}`);
      console.log('카테고리 삭제 성공:', response.data);
      // 삭제된 카테고리를 목록에서 제거
      setCategories(categories.filter(category => category.id !== id));
      setOpenPanel(null);
      // 게시물 수 재설정
      fetchPosts();
    } catch (error) {
      console.error('카테고리 삭제 오류:', error);
      if (error.response && error.response.status === 404) {
        alert("삭제할 카테고리를 찾을 수 없습니다.");
      } else {
        alert("카테고리를 삭제하는 중 오류가 발생했습니다.");
      }
    }
  };

  // **카테고리 확장/축소 토글 함수**
  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // **게시물 삭제 함수 추가**
  const handleDeletePost = async (postId) => {
    if (!isLoggedIn) return; // 로그인 상태 확인

    if (!window.confirm("정말로 이 게시물을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:5000/api/posts/${postId}`);
      console.log('게시물 삭제 성공:', response.data);
      // 삭제된 게시물을 목록에서 제거
      setPosts(posts.filter(post => post.id !== postId));
      setPostCount(postCount - 1);
      alert("게시물이 성공적으로 삭제되었습니다.");
    } catch (error) {
      console.error('게시물 삭제 오류:', error);
      if (error.response && error.response.status === 404) {
        alert("삭제할 게시물을 찾을 수 없습니다.");
      } else {
        alert("게시물을 삭제하는 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <Wrapper>
      <Header>
        <Title>Zion's Blog</Title>
        <RightContainer>
          {isLoggedIn && (
            <>
              {/* 카테고리 삭제 버튼과 패널을 ButtonWrapper로 감쌈 */}
              <ButtonWrapper>
                <DeleteCategoryButton onClick={() => togglePanel('delete')} ref={deleteButtonRef}>
                  카테고리 삭제
                </DeleteCategoryButton>
                {/* 카테고리 삭제 패널 */}
                <DeleteCategoryPanel visible={openPanel === 'delete'} ref={deletePanelRef}>
                  <DeleteCategoryTitle>삭제할 카테고리 선택</DeleteCategoryTitle>
                  {categories.length === 0 ? (
                    <p>삭제할 카테고리가 없습니다.</p>
                  ) : (
                    <DeleteCategoryList>
                      {categories.map((category) => (
                        <DeleteCategoryItem key={category.id} onClick={() => {
                          if (window.confirm(`정말로 "${category.name}" 카테고리를 삭제하시겠습니까?`)) {
                            handleDeleteCategory(category.id);
                          }
                        }}>
                          · {category.name}
                        </DeleteCategoryItem>
                      ))}
                    </DeleteCategoryList>
                  )}
                </DeleteCategoryPanel>
              </ButtonWrapper>

              {/* 카테고리 추가 버튼과 패널을 ButtonWrapper로 감쌈 */}
              <ButtonWrapper>
                <AddCategoryButtonStyled onClick={() => togglePanel('add')} ref={addButtonRef}>
                  카테고리 추가
                </AddCategoryButtonStyled>
                {/* 카테고리 추가 패널 */}
                <AddCategoryPanel visible={openPanel === 'add'} ref={addPanelRef}>
                  <AddCategoryTitle>카테고리 작성하기</AddCategoryTitle>
                  <AddCategoryInput
                    type="text"
                    placeholder="카테고리 입력"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                  <AddCategoryButtons>
                    <ConfirmButton onClick={handleAddCategory}>
                      확인
                    </ConfirmButton>
                    <CancelButton onClick={handleCancelAddCategory}>
                      취소
                    </CancelButton>
                  </AddCategoryButtons>
                </AddCategoryPanel>
              </ButtonWrapper>
              
              {/* 글쓰기 버튼은 별도의 ButtonWrapper로 감쌌지만, 패널이 없으므로 필요 없음 */}
              <Button onClick={() => navigate("/write")}>
                글쓰기
              </Button>
            </>
          )}
          
          {isLoggedIn ? (
            <LoginButton>
              Welcome Zion!
              {/* 로그인 후 표시되는 메시지 */}
            </LoginButton>
          ) : (
            <LoginButton onClick={() => navigate("/login")}>Login</LoginButton>
          )}
        </RightContainer>
      </Header>

      {/* NameContainer 수정: External Buttons를 수평으로 배열 */}
      <NameContainer>
        <Name>Zion Choi - 왕초보입니다.</Name>
        <ButtonContainerStyled>
          <ExternalButton href="https://www.sch.ac.kr/" target="_blank" rel="noopener noreferrer">
            SCH Univ
          </ExternalButton>
          <ExternalButton href="https://github.com/CHOIZION" target="_blank" rel="noopener noreferrer">
            Github
          </ExternalButton>
          <ExternalButton href="mailto:czion04@gmail.com">Email</ExternalButton>
        </ButtonContainerStyled>
      </NameContainer>
      
      {/* MainContent에서 PostsContainer 제거 */}
      <MainContent>
        {/* 기존 PostsContainer를 제거했습니다 */}
      </MainContent>

      <Categories>
        {/* CategoryHeader에서 onClick과 화살표 제거 */}
        <CategoryHeader>
          <CategoryTitle>전체 게시물 ({postCount})</CategoryTitle>
        </CategoryHeader>
        <CategoryListWrapper>
          <CategoryList ref={listRef}>
            {categories.map((category) => (
              <CategoryItem key={category.id}>
                <CategoryItemHeader onClick={() => toggleCategory(category.id)}>
                  {expandedCategories[category.id] ? <span>▼</span> : <span>▶</span>}
                  · {category.name}
                </CategoryItemHeader>
                <CategoryPostsWrapper visible={expandedCategories[category.id]}>
                  <CategoryPosts>
                    {posts.filter(post => post.category_id === category.id).length === 0 ? (
                      <p>게시물이 없습니다.</p>
                    ) : (
                      posts
                        .filter(post => post.category_id === category.id)
                        .map(post => (
                          <CategoryPostItem key={post.id} onClick={() => navigate(`/read/${post.id}`)}>
                            <PostInfo>
                              <CategoryPostTitle>{post.title}</CategoryPostTitle>
                              {post.tags && <CategoryPostTags>{post.tags}</CategoryPostTags>}
                              <CategoryPostDate>작성일: {new Date(post.created_at).toLocaleDateString()}</CategoryPostDate>
                            </PostInfo>
                            {isLoggedIn && (
                              <DeletePostButton onClick={(e) => {
                                e.stopPropagation(); // 클릭 이벤트 전파 방지
                                handleDeletePost(post.id);
                              }}>
                                삭제
                              </DeletePostButton>
                            )}
                          </CategoryPostItem>
                        ))
                    )}
                  </CategoryPosts>
                </CategoryPostsWrapper>
              </CategoryItem>
            ))}
          </CategoryList>
        </CategoryListWrapper>
      </Categories>
    </Wrapper>
  );
}

export default Home;
