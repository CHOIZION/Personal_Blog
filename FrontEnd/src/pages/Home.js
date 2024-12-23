// Home.js
import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// 기존 Styled Components 유지
const Wrapper = styled.div`
  width: 100%;
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

const EditPostButton = styled.button`
  padding: 4px 8px;
  background-color: #17a2b8; /* 파란색에 가까운 톤 */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.3s ease;
  margin-right: 5px; /* 삭제 버튼과 간격 */

  &:hover {
    background-color: #138496;
  }
`;

const LoginButton = styled.button`
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #333;
  background: none;
  border: none;
  padding: 0;

  &:hover {
    text-decoration: underline;
    color: #bbb;
  }
`;

const NameContainer = styled.div`
  display: flex;
  flex-direction: column; /* 수직 정렬 */
  align-items: flex-start;
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
  flex-direction: row; /* 수평 정렬 */
  gap: 10px; 
`;

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
    background-color: #f0f0f0;
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
  display: flex;
  align-items: center;
  margin-left: 40px;
  font-size: 18px;
  color: #333;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    margin-left: 20px;
  }
`;

const CategoryTitle = styled.h2`
  font-size: 18px;
  margin: 0;
  margin-top: -5px;
`;

const CategoryListWrapper = styled.div`
  margin-left: 40px;
  margin-top: 10px;
  
  @media (max-width: 768px) {
    margin-left: 20px;
  }
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
`;

const CategoryPosts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

// 포스트 박스를 버튼처럼 보이게 하기 위한 스타일
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
  cursor: pointer; 
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

const AddCategoryPanel = styled.div`
  position: absolute;
  top: 50px; 
  left: 0; 
  width: 250px;
  padding: 20px;
  border: 1px solid #ddd;
  background: #f9f9f9;
  border-radius: 4px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  visibility: ${(props) => (props.visible ? "visible" : "hidden")};
  opacity: ${(props) => (props.visible ? "1" : "0")};
  z-index: 10;
`;

const DeleteCategoryPanel = styled.div`
  position: absolute; 
  top: 50px; 
  left: 0; 
  width: 250px;
  padding: 20px;
  border: 1px solid #ddd;
  background: #fff3f3;
  border-radius: 4px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  visibility: ${(props) => (props.visible ? "visible" : "hidden")};
  opacity: ${(props) => (props.visible ? "1" : "0")};
  z-index: 10;
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

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  gap: 10px;
`;

const PaginationButton = styled.button`
  padding: 4px 8px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const PageNumbers = styled.div`
  display: flex;
  gap: 5px;
`;

const PageNumber = styled.button`
  padding: 4px 8px;
  background-color: ${(props) => (props.active ? "#007bff" : "#f0f0f0")};
  color: ${(props) => (props.active ? "white" : "#333")};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;

  &:hover {
    background-color: ${(props) => (props.active ? "#0056b3" : "#ddd")};
  }
`;

const POSTS_PER_PAGE = 10;

function Home({ isLoggedIn }) {
  const [postCount, setPostCount] = useState(0); // 전체 게시물 수
  const [categories, setCategories] = useState([]); // 카테고리 목록
  const [openPanel, setOpenPanel] = useState(null); // 'add', 'delete', or null
  const [newCategory, setNewCategory] = useState("");

  const [posts, setPosts] = useState([]); 
  const [expandedCategories, setExpandedCategories] = useState({});
  const [currentPage, setCurrentPage] = useState({});

  const navigate = useNavigate();

  const listRef = useRef(null);

  const addButtonRef = useRef(null);
  const deleteButtonRef = useRef(null);
  const addPanelRef = useRef(null);
  const deletePanelRef = useRef(null);

  // 환경 변수에서 API 기본 URL 가져오기
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    fetchCategories();
    fetchPosts();
  }, []);

  // 카테고리 조회
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories`);
      setCategories(response.data.categories);
    } catch (error) {
      console.error('카테고리 가져오기 오류:', error);
      alert('카테고리를 가져오는 중 오류가 발생했습니다.');
    }
  };

  // 게시물 조회
  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/posts`);
      // 오래된 순으로 정렬
      const sortedPosts = response.data.posts.sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );
      setPosts(sortedPosts);
      setPostCount(sortedPosts.length);
    } catch (error) {
      console.error('게시물 가져오기 오류:', error);
      alert('게시물을 가져오는 중 오류가 발생했습니다.');
    }
  };

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

  // 카테고리 추가
  const handleAddCategory = async () => {
    const trimmedCategory = newCategory.trim();
    if (trimmedCategory === "") {
      alert("카테고리 이름을 입력하세요.");
      return;
    }
  
    try {
      const response = await axios.post(
        `${API_BASE_URL}/categories`, 
        { name: trimmedCategory },
        { withCredentials: true }
      );
      console.log('카테고리 추가 성공:', response.data);
      setCategories([...categories, response.data.category]);
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

  const handleCancelAddCategory = () => {
    setNewCategory("");
    setOpenPanel(null);
  };

  // 카테고리 삭제
  const handleDeleteCategory = async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/categories/${id}`, {
        withCredentials: true,
      });
      console.log('카테고리 삭제 성공:', response.data);
      setCategories(categories.filter((category) => category.id !== id));
      setOpenPanel(null);
      fetchPosts(); // 게시물 수 재설정
    } catch (error) {
      console.error('카테고리 삭제 오류:', error);
      if (error.response && error.response.status === 404) {
        alert("삭제할 카테고리를 찾을 수 없습니다.");
      } else {
        alert("카테고리를 삭제하는 중 오류가 발생했습니다.");
      }
    }
  };

  // 카테고리 확장/축소
  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));

    // 열리는 순간 페이지 1로 설정
    if (!expandedCategories[categoryId]) {
      setCurrentPage((prev) => ({
        ...prev,
        [categoryId]: 1,
      }));
    }
  };

  // 게시물 삭제
  const handleDeletePost = async (postId) => {
    if (!isLoggedIn) return;
  
    if (!window.confirm("정말로 이 게시물을 삭제하시겠습니까?")) {
      return;
    }
  
    try {
      const response = await axios.delete(`${API_BASE_URL}/posts/${postId}`, {
        withCredentials: true,
      });
      console.log('게시물 삭제 성공:', response.data);
      setPosts(posts.filter((post) => post.id !== postId));
      setPostCount(postCount - 1);
      alert("게시물이 성공적으로 삭제되었습니다.");
    } catch (error) {
      console.error('게시물 삭제 오류:', error);
      if (error.response && error.response.status === 404) {
        alert("삭제할 게시물을 찾을 수 없거나 권한이 없습니다.");
      } else {
        alert("게시물을 삭제하는 중 오류가 발생했습니다.");
      }
    }
  };

  // 게시물 수정 버튼 클릭
  const handleEditPost = (postId) => {
    if (!isLoggedIn) return;
    // 수정 페이지로 이동 (/write?edit=postId)
    navigate(`/write?edit=${postId}`);
  };

  return (
    <Wrapper>
      <Header>
        <Title>Zion's Blog</Title>
        <RightContainer>
          {isLoggedIn && (
            <>
              <ButtonWrapper>
                <DeleteCategoryButton onClick={() => togglePanel('delete')} ref={deleteButtonRef}>
                  카테고리 삭제
                </DeleteCategoryButton>
                <DeleteCategoryPanel visible={openPanel === 'delete'} ref={deletePanelRef}>
                  <DeleteCategoryTitle>삭제할 카테고리 선택</DeleteCategoryTitle>
                  {categories.length === 0 ? (
                    <p>삭제할 카테고리가 없습니다.</p>
                  ) : (
                    <DeleteCategoryList>
                      {categories.map((category) => (
                        <DeleteCategoryItem
                          key={category.id}
                          onClick={() => {
                            if (window.confirm(`정말로 "${category.name}" 카테고리를 삭제하시겠습니까?`)) {
                              handleDeleteCategory(category.id);
                            }
                          }}
                        >
                          · {category.name}
                        </DeleteCategoryItem>
                      ))}
                    </DeleteCategoryList>
                  )}
                </DeleteCategoryPanel>
              </ButtonWrapper>

              <ButtonWrapper>
                <AddCategoryButtonStyled onClick={() => togglePanel('add')} ref={addButtonRef}>
                  카테고리 추가
                </AddCategoryButtonStyled>
                <AddCategoryPanel visible={openPanel === 'add'} ref={addPanelRef}>
                  <AddCategoryTitle>카테고리 작성하기</AddCategoryTitle>
                  <AddCategoryInput
                    type="text"
                    placeholder="카테고리 입력"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                  <AddCategoryButtons>
                    <ConfirmButton onClick={handleAddCategory}>확인</ConfirmButton>
                    <CancelButton onClick={handleCancelAddCategory}>취소</CancelButton>
                  </AddCategoryButtons>
                </AddCategoryPanel>
              </ButtonWrapper>
              
              {/* 글쓰기 버튼 */}
              <Button onClick={() => navigate("/write")}>글쓰기</Button>
            </>
          )}
          
          {isLoggedIn ? (
            <LoginButton onClick={() => navigate("/logout")}>
              Welcome Zion!
            </LoginButton>
          ) : (
            <LoginButton onClick={() => navigate("/login")}>Login</LoginButton>
          )}
        </RightContainer>
      </Header>

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
      
      <Categories>
        <CategoryHeader>
          <CategoryTitle>전체 게시물 ({postCount})</CategoryTitle>
        </CategoryHeader>
        <CategoryListWrapper>
          <CategoryList ref={listRef}>
            {categories.map((category) => {
              // 해당 카테고리에 속한 게시물만 필터링
              const categoryPosts = posts
                .filter((post) => post.category_id === category.id)
                .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

              const totalPosts = categoryPosts.length;
              const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
              const currentCatPage = currentPage[category.id] || 1;
              const startIndex = (currentCatPage - 1) * POSTS_PER_PAGE;
              const endIndex = startIndex + POSTS_PER_PAGE;
              // 최신글이 위에 오도록 reverse() 적용
              const displayedPosts = categoryPosts.slice(startIndex, endIndex).reverse();

              return (
                <CategoryItem key={category.id}>
                  <CategoryItemHeader onClick={() => toggleCategory(category.id)}>
                    {expandedCategories[category.id] ? <span>▼</span> : <span>▶</span>}
                    &nbsp;· {category.name}
                  </CategoryItemHeader>
                  {expandedCategories[category.id] && (
                    <CategoryPostsWrapper>
                      <CategoryPosts>
                        {displayedPosts.length === 0 ? (
                          <p>게시물이 없습니다.</p>
                        ) : (
                          displayedPosts.map((post, index) => {
                            const number = totalPosts - (currentCatPage - 1) * POSTS_PER_PAGE - index;
                            return (
                              <CategoryPostItem 
                                key={post.id}
                                // 게시물 제목/내용 영역을 클릭하면 상세 페이지(읽기 페이지)로 이동
                                onClick={() => navigate(`/read/${post.id}`)}
                              >
                                <PostInfo>
                                  <CategoryPostTitle>
                                    {number}. {post.title}
                                  </CategoryPostTitle>
                                  {post.tags && (
                                    <CategoryPostTags>{post.tags}</CategoryPostTags>
                                  )}
                                  <CategoryPostDate>
                                    작성일: {new Date(post.created_at).toLocaleDateString()}
                                  </CategoryPostDate>
                                </PostInfo>

                                {/* 수정 / 삭제 버튼 영역 */}
                                {isLoggedIn && (
                                  <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <EditPostButton
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditPost(post.id);
                                      }}
                                    >
                                      수정
                                    </EditPostButton>
                                    <DeletePostButton
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeletePost(post.id);
                                      }}
                                    >
                                      삭제
                                    </DeletePostButton>
                                  </div>
                                )}
                              </CategoryPostItem>
                            );
                          })
                        )}
                      </CategoryPosts>

                      {totalPages > 1 && (
                        <Pagination>
                          <PaginationButton
                            onClick={() =>
                              setCurrentPage((prev) => ({
                                ...prev,
                                [category.id]: Math.max(prev[category.id] - 1, 1),
                              }))
                            }
                            disabled={currentCatPage === 1}
                          >
                            Previous
                          </PaginationButton>

                          <PageNumbers>
                            {Array.from({ length: totalPages }, (_, i) => (
                              <PageNumber
                                key={i}
                                active={currentCatPage === i + 1}
                                onClick={() =>
                                  setCurrentPage((prev) => ({
                                    ...prev,
                                    [category.id]: i + 1,
                                  }))
                                }
                              >
                                {i + 1}
                              </PageNumber>
                            ))}
                          </PageNumbers>

                          <PaginationButton
                            onClick={() =>
                              setCurrentPage((prev) => ({
                                ...prev,
                                [category.id]: Math.min(prev[category.id] + 1, totalPages),
                              }))
                            }
                            disabled={currentCatPage === totalPages}
                          >
                            Next
                          </PaginationButton>
                        </Pagination>
                      )}
                    </CategoryPostsWrapper>
                  )}
                </CategoryItem>
              );
            })}
          </CategoryList>
        </CategoryListWrapper>
      </Categories>
    </Wrapper>
  );
}

export default Home;
