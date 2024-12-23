// src/pages/Write.js

import React, { useRef, useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { useSearchParams } from 'react-router-dom';

// --------------------
//   Styled Components
// --------------------
const GlobalStyle = createGlobalStyle`
  h1, h2, h3, h4 {
    margin: 0;
    padding: 0;
    line-height: 1.2;
  }
  body, html, #root {
    height: 100%;
    margin: 0;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  font-family: Arial, sans-serif;
  border: 1px solid #ddd;
  background: #f0f0f0;
`;

const TitleInput = styled.div`
  font-size: 32px;
  font-weight: bold;
  outline: none;
  margin-bottom: 10px;
  min-height: 50px;
  cursor: text;
  color: #333;

  &:empty::before {
    content: "제목을 입력하세요.";
    color: #ccc;
  }
`;

const TagInput = styled.div`
  font-size: 14px;
  outline: none;
  margin-bottom: 10px;
  min-height: 20px;
  cursor: text;
  color: #333;

  &:empty::before {
    content: "소제목(또는 태그)을 입력하세요.";
    color: #ccc;
  }
`;

const Toolbar = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  position: relative;
`;

const ToolButton = styled.button`
  border: 1px solid #ddd;
  background: #f9f9f9;
  cursor: pointer;
  padding: 5px 10px;
  font-size: 14px;
  border-radius: 4px;
  &:hover {
    background: #eee;
  }
`;

const LinkPopup = styled.div`
  position: absolute;
  top: 40px;
  left: 0;
  background: #ffffff;
  border: 1px solid #ddd;
  padding: 10px;
  box-sizing: border-box;
  z-index: 10;
  display: flex;
  gap: 5px;
  border-radius: 4px;
`;

const ResizeHandle = styled.div`
  width: 100%;
  height: 100%;
  cursor: se-resize;
`;

const ImageResizer = styled.div`
  position: absolute;
  width: 12px;
  height: 12px;
  background: #007bff;
  cursor: se-resize;
  z-index: 20;
  border-radius: 50%;
`;

const ContentContainer = styled.div`
  flex-grow: 1;
  position: relative;
  border: 1px solid #ddd;
  padding: 20px;
  box-sizing: border-box;
  overflow-y: auto;
  background: #f0f0f0;
`;

const ContentInput = styled.div`
  font-size: 16px;
  outline: none;
  cursor: text;
  color: #333;
  min-height: 100%;
  box-sizing: border-box;

  p, div, span, h1, h2, h3, h4 {
    margin: 0;
    padding: 0;
  }

  img {
    max-width: 100%;
    height: auto;
    display: inline-block;
    margin: 10px 0;
    border: 2px solid transparent;
    transition: border 0.2s;
    vertical-align: middle;
  }
  img.selected {
    border: 2px solid #007bff;
  }
  a {
    color: #007bff;
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
`;

const SaveButtonsContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
`;

const SaveButton = styled.button`
  padding: 10px 20px;
  background-color: ${(props) => (props.primary ? '#28a745' : '#007bff')};
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  opacity: ${(props) => (props.disabled ? 0.6 : 1)};
  pointer-events: ${(props) => (props.disabled ? 'none' : 'auto')};

  &:hover {
    background-color: ${(props) => (props.primary ? '#218838' : '#0056b3')};
  }
`;

const ModalBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
`;

const ModalContent = styled.div`
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-height: 80%;
  overflow-y: auto;
`;

const TemporaryPostItem = styled.div`
  padding: 10px;
  border-bottom: 1px solid #ddd;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  &:hover {
    background-color: #f1f1f1;
  }
`;

const DeleteButton = styled.button`
  background: #dc3545;
  border: none;
  color: white;
  padding: 5px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  &:hover {
    background: #c82333;
  }
`;

const CategoryItemModal = styled.div`
  padding: 10px;
  border-bottom: 1px solid #ddd;
  cursor: pointer;
  background-color: ${(props) => (props.selected ? '#007bff' : '#fff')};
  color: ${(props) => (props.selected ? '#fff' : '#333')};
  display: flex;
  justify-content: space-between;
  align-items: center;
  &:hover {
    background-color: ${(props) => (props.selected ? '#0056b3' : '#f1f1f1')};
  }
`;

const ConfirmButton = styled.button`
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  &:hover {
    background-color: #218838;
  }
  &:disabled {
    background-color: #94d3a2;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  background-color: #6c757d;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  &:hover {
    background-color: #5a6268;
  }
`;

const Notification = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: ${(props) => (props.error ? '#dc3545' : '#28a745')};
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  z-index: 200;
`;

// --------------------
//   Main Component
// --------------------
function Write() {
  // ------------------------------
  //   1) 모든 Hook 최상단에서 호출
  // ------------------------------

  // 쿼리 파라미터에서 edit=id 추출
  const [searchParams] = useSearchParams();
  const editPostId = searchParams.get('edit');

  // 에디터 관련 ref
  const contentRef = useRef(null);
  const fileInputRef = useRef(null);
  const titleRef = useRef(null);
  const tagRef = useRef(null);

  // 상태들
  const [user, setUser] = useState(null);       // 사용자 정보
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [authError, setAuthError] = useState(null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [showLinkPopup, setShowLinkPopup] = useState(false);
  const [linkURL, setLinkURL] = useState('');
  const [savedSelection, setSavedSelection] = useState(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const [resizing, setResizing] = useState(false);
  const [startX, setStartX] = useState(null);
  const [startWidth, setStartWidth] = useState(null);
  const [resizerPos, setResizerPos] = useState({ top: 0, left: 0 });

  // 임시 저장 모달
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [temporaryPosts, setTemporaryPosts] = useState([]);

  // 알림 메시지
  const [notification, setNotification] = useState({ message: '', error: false });

  // 카테고리 모달
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // API 주소
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
  
  // ------------------------------
  //   2) 모든 useEffect도 위에서
  // ------------------------------

  // (1) 컴포넌트 최초 마운트 시 사용자 정보 불러오기
  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/user`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data); // { id, username }
        } else {
          const errorData = await response.json();
          setAuthError(errorData.message || '사용자 정보를 불러오는 중 오류가 발생했습니다.');
        }
      } catch (error) {
        console.error('fetchUser 오류:', error);
        setAuthError('사용자 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    })();
  }, [API_BASE_URL]);

  // (2) editPostId가 있을 경우 => 수정 모드
  useEffect(() => {
    if (!editPostId) return;
    setIsEditMode(true);
    fetchPostToEdit(editPostId);
    // eslint-disable-next-line
  }, [editPostId]);

  // (3) 에디터 영역에서 이미지/링크 클릭/키다운 이벤트 등록
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const handleContentClick = (e) => {
      if (e.target.tagName === 'IMG') {
        setSelectedImage(e.target);
      } else if (e.target.tagName === 'A') {
        // 링크는 새 탭에서 열기
        e.preventDefault();
        const href = e.target.getAttribute('href');
        if (href) {
          window.open(href, '_blank');
        }
      } else {
        setSelectedImage(null);
      }
    };

    const handleKeyDown = (e) => {
      if (selectedImage && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault();
        selectedImage.remove();
        setSelectedImage(null);
      }
    };

    el.addEventListener('click', handleContentClick);
    el.addEventListener('keydown', handleKeyDown);

    // cleanup
    return () => {
      el.removeEventListener('click', handleContentClick);
      el.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImage]);

  // (4) 이미지 선택 시 리사이즈 핸들 위치 갱신
  useEffect(() => {
    if (!selectedImage || !contentRef.current) {
      // 이미지 선택 해제 시, 핸들 제거
      if (contentRef.current) {
        const imgs = contentRef.current.querySelectorAll('img');
        imgs.forEach((img) => img.classList.remove('selected'));
      }
      setResizerPos({ top: 0, left: 0 });
      return;
    }

    // 선택된 이미지에 CSS 추가
    selectedImage.classList.add('selected');

    // 리사이즈 핸들 위치 계산
    const imageRect = selectedImage.getBoundingClientRect();
    const containerRect = contentRef.current.getBoundingClientRect();
    setResizerPos({
      top: imageRect.bottom - containerRect.top + contentRef.current.scrollTop - 6,
      left: imageRect.right - containerRect.left + contentRef.current.scrollLeft - 6,
    });
  }, [selectedImage]);

  // (5) 이미지 리사이즈 이벤트
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!resizing || !selectedImage) return;
      e.preventDefault();
      const diffX = e.clientX - startX;
      const newWidth = startWidth + diffX;
      if (newWidth > 50) {
        selectedImage.width = newWidth;
        // 핸들 위치 재계산
        const imageRect = selectedImage.getBoundingClientRect();
        const containerRect = contentRef.current.getBoundingClientRect();
        setResizerPos({
          top: imageRect.bottom - containerRect.top + contentRef.current.scrollTop - 6,
          left: imageRect.right - containerRect.left + contentRef.current.scrollLeft - 6,
        });
        setStartX(e.clientX);
        setStartWidth(newWidth);
      }
    };

    const handleMouseUp = () => setResizing(false);

    if (resizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      if (resizing) {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      }
    };
  }, [resizing, selectedImage, startX, startWidth]);

  // (6) contentRef 스크롤 시 리사이즈 핸들 위치 갱신
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const handleScroll = () => {
      if (selectedImage) {
        const imageRect = selectedImage.getBoundingClientRect();
        const containerRect = el.getBoundingClientRect();
        setResizerPos({
          top: imageRect.bottom - containerRect.top + el.scrollTop - 6,
          left: imageRect.right - containerRect.left + el.scrollLeft - 6,
        });
      }
    };

    el.addEventListener('scroll', handleScroll);
    return () => {
      el.removeEventListener('scroll', handleScroll);
    };
  }, [selectedImage]);

  // (7) 알림 메시지 자동 사라짐
  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: '', error: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // -------------------------------
  //   3) 필요한 함수들 (위쪽)
  // -------------------------------

  // (a) 수정할 게시물 불러오기
  const fetchPostToEdit = async (postId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '게시물을 불러오는 중 오류가 발생했습니다.');
      }
      const data = await response.json();
      const { title, tags, content, category_id, user_id: postUserId } = data.post;

      // 혹시나, 본인 게시물이 아닐 경우
      if (user && postUserId !== user.id) {
        setNotification({ message: '해당 게시물에 대한 수정 권한이 없습니다.', error: true });
        return;
      }

      // 에디터에 기존 내용 세팅
      if (titleRef.current) titleRef.current.innerText = title || '';
      if (tagRef.current) tagRef.current.innerText = tags || '';
      if (contentRef.current) contentRef.current.innerHTML = content || '';
      setSelectedCategoryId(category_id);
    } catch (error) {
      console.error(error);
      setNotification({ message: error.message, error: true });
    }
  };

  // (b) 이미지 삽입
  const insertImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (contentRef.current) {
        contentRef.current.focus();
        document.execCommand('insertImage', false, event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // (c) 링크 삽입
  const insertLink = () => {
    const selection = saveSelectionState();
    setSavedSelection(selection);
    setShowLinkPopup(true);
  };
  const applyLink = () => {
    if (linkURL.trim() !== '') {
      restoreSelectionState(savedSelection);
      document.execCommand('createLink', false, linkURL);
    }
    setShowLinkPopup(false);
    setLinkURL('');
  };

  // (d) Heading 적용, Bold 등
  const applyHeading = (heading) => {
    document.execCommand('formatBlock', false, heading);
  };
  const makeBold = () => {
    document.execCommand('bold', false, null);
  };

  // (e) Selection
  const saveSelectionState = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      return sel.getRangeAt(0);
    }
    return null;
  };
  const restoreSelectionState = (range) => {
    const sel = window.getSelection();
    if (range && sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
  };

  // (f) 이미지 리사이즈 시작
  const startResize = (e) => {
    if (!selectedImage) return;
    e.preventDefault();
    setResizing(true);
    setStartX(e.clientX);
    setStartWidth(selectedImage.width);
  };

  // -------------------------------
  //   4) 임시 저장 & 불러오기
  // -------------------------------
  const handleTemporarySave = async () => {
    if (!user?.id) {
      setNotification({ message: '로그인이 필요합니다.', error: true });
      return;
    }
    const title = titleRef.current?.innerText.trim();
    const tags = tagRef.current?.innerText.trim();
    const content = contentRef.current?.innerHTML.trim();
    if (!title || !content) {
      setNotification({ message: '제목과 내용을 모두 입력하세요.', error: true });
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/temporary_posts`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, tags, content }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log('임시 저장 성공:', data);
        setNotification({ message: '임시 저장이 완료되었습니다.', error: false });
      } else {
        const errorData = await response.json();
        setNotification({ message: errorData.message || '임시 저장 중 오류가 발생했습니다.', error: true });
      }
    } catch (error) {
      console.error('임시 저장 오류:', error);
      setNotification({ message: '임시 저장 중 오류가 발생했습니다.', error: true });
    }
  };

  const handleLoad = async () => {
    if (!user?.id) {
      setNotification({ message: '로그인이 필요합니다.', error: true });
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/temporary_posts`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        setTemporaryPosts(data.temporary_posts);
        setShowLoadModal(true);
      } else {
        const errorData = await response.json();
        setNotification({ message: errorData.message || '임시 저장된 글을 불러오는 중 오류가 발생했습니다.', error: true });
      }
    } catch (error) {
      console.error('불러오기 오류:', error);
      setNotification({ message: '임시 저장된 글을 불러오는 중 오류가 발생했습니다.', error: true });
    }
  };

  const loadTemporaryPost = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/temporary_posts/${id}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        const { title, tags, content } = data.temporary_post;
        if (titleRef.current) titleRef.current.innerText = title || '';
        if (tagRef.current) tagRef.current.innerText = tags || '';
        if (contentRef.current) contentRef.current.innerHTML = content || '';
        setShowLoadModal(false);
        setNotification({ message: '임시 저장된 글을 불러왔습니다.', error: false });
      } else {
        const errorData = await response.json();
        setNotification({ message: errorData.message || '특정 임시 저장 글을 불러오는 중 오류가 발생했습니다.', error: true });
      }
    } catch (error) {
      console.error('특정 임시 저장 글 불러오기 오류:', error);
      setNotification({ message: '특정 임시 저장 글을 불러오는 중 오류가 발생했습니다.', error: true });
    }
  };

  const handleDeleteTemporary = async (id) => {
    if (!window.confirm('정말로 이 임시 저장 글을 삭제하시겠습니까?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/temporary_posts/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        setTemporaryPosts((prev) => prev.filter((post) => post.id !== id));
        setNotification({ message: '임시 저장 글이 삭제되었습니다.', error: false });
      } else {
        const errorData = await response.json();
        setNotification({ message: errorData.message || '임시 저장 글을 삭제하는 중 오류가 발생했습니다.', error: true });
      }
    } catch (error) {
      console.error('임시 저장 글 삭제 오류:', error);
      setNotification({ message: '임시 저장 글을 삭제하는 중 오류가 발생했습니다.', error: true });
    }
  };

  // -------------------------------
  //   5) 글 저장하기(카테고리)
  // -------------------------------
  const handleSave = async () => {
    if (!user?.id) {
      setNotification({ message: '로그인이 필요합니다.', error: true });
      return;
    }
    try {
      // 카테고리 목록 먼저 불러옴
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
        setShowCategoryModal(true);
      } else {
        const errorData = await response.json();
        setNotification({ message: errorData.message || '카테고리를 불러오는 중 오류가 발생했습니다.', error: true });
      }
    } catch (error) {
      console.error('카테고리 불러오기 오류:', error);
      setNotification({ message: '카테고리를 불러오는 중 오류가 발생했습니다.', error: true });
    }
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategoryId(categoryId);
  };

  const confirmSave = async () => {
    if (!user?.id) {
      setNotification({ message: '로그인이 필요합니다.', error: true });
      return;
    }
    const title = titleRef.current?.innerText.trim();
    const tags = tagRef.current?.innerText.trim();
    const content = contentRef.current?.innerHTML.trim();
    if (!title || !content) {
      setNotification({ message: '제목과 내용을 모두 입력하세요.', error: true });
      return;
    }
    if (!selectedCategoryId) {
      setNotification({ message: '카테고리를 선택하세요.', error: true });
      return;
    }

    try {
      let response;
      if (isEditMode && editPostId) {
        // PUT (수정)
        response = await fetch(`${API_BASE_URL}/posts/${editPostId}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, tags, content, category_id: selectedCategoryId }),
        });
      } else {
        // POST (새로 작성)
        response = await fetch(`${API_BASE_URL}/complete_posts`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, tags, content, category_id: selectedCategoryId }),
        });
      }

      if (response.ok) {
        const data = await response.json();
        setNotification({
          message: isEditMode
            ? '글이 성공적으로 수정되었습니다.'
            : '글이 성공적으로 저장되었습니다.',
          error: false,
        });

        // 폼 초기화
        if (titleRef.current) titleRef.current.innerText = '';
        if (tagRef.current) tagRef.current.innerText = '';
        if (contentRef.current) contentRef.current.innerHTML = '';

        setShowCategoryModal(false);
        setSelectedCategoryId(null);

        // 수정 모드였다면 해제
        if (isEditMode) setIsEditMode(false);
      } else {
        const errorData = await response.json();
        setNotification({ message: errorData.message || '글을 저장하는 중 오류가 발생했습니다.', error: true });
      }
    } catch (error) {
      console.error('글 저장 오류:', error);
      setNotification({ message: '글을 저장하는 중 오류가 발생했습니다.', error: true });
    }
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
  };

  const closeLoadModal = () => {
    setShowLoadModal(false);
  };

  // ----------------------------------------
  //   6) 여기서부터 렌더링 (단일 return)
  // ----------------------------------------

  // 조건 분기는 “Hook을 모두 선언한 이후”에 처리
  if (loading) {
    return <div>로딩 중...</div>;
  }
  if (authError) {
    return <div>{authError}</div>;
  }
  if (!user) {
    return <div>로그인이 필요합니다.</div>;
  }

  return (
    <>
      <GlobalStyle />
      <Container>
        {/* 제목 & 태그 입력 */}
        <TitleInput
          contentEditable
          suppressContentEditableWarning={true}
          ref={titleRef}
        />
        <TagInput
          contentEditable
          suppressContentEditableWarning={true}
          ref={tagRef}
        />

        {/* 툴바 */}
        <Toolbar>
          <ToolButton onClick={() => applyHeading('H4')}>####</ToolButton>
          <ToolButton onClick={() => applyHeading('H3')}>###</ToolButton>
          <ToolButton onClick={() => applyHeading('H2')}>##</ToolButton>
          <ToolButton onClick={() => applyHeading('H1')}>#</ToolButton>
          <ToolButton onClick={makeBold}>B</ToolButton>
          <ToolButton onClick={insertImage}>🖼️</ToolButton>
          <ToolButton onClick={insertLink}>🔗</ToolButton>

          {showLinkPopup && (
            <LinkPopup>
              <input
                type="text"
                placeholder="링크를 입력해주세요"
                value={linkURL}
                onChange={(e) => setLinkURL(e.target.value)}
              />
              <button onClick={applyLink}>확인</button>
              <button onClick={() => {
                setShowLinkPopup(false);
                setLinkURL('');
              }}>취소</button>
            </LinkPopup>
          )}
        </Toolbar>

        {/* 이미지 파일 선택 input */}
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        {/* 메인 에디터 영역 */}
        <ContentContainer>
          <ContentInput
            contentEditable
            suppressContentEditableWarning={true}
            ref={contentRef}
            style={{ minHeight: '100%' }}
          />
          {selectedImage && (
            <ImageResizer
              style={{
                top: resizerPos.top,
                left: resizerPos.left,
              }}
            >
              <ResizeHandle onMouseDown={startResize} />
            </ImageResizer>
          )}
        </ContentContainer>

        {/* 버튼들 */}
        <SaveButtonsContainer>
          <SaveButton onClick={handleTemporarySave} disabled={!user?.id}>
            임시 저장
          </SaveButton>
          <SaveButton primary onClick={handleSave} disabled={!user?.id}>
            {isEditMode ? '수정하기' : '저장하기'}
          </SaveButton>
          <SaveButton onClick={handleLoad} disabled={!user?.id}>
            불러오기
          </SaveButton>
        </SaveButtonsContainer>
      </Container>

      {/* 임시 저장글 불러오기 모달 */}
      {showLoadModal && (
        <ModalBackground onClick={closeLoadModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h2>임시 저장된 글 목록</h2>
            {temporaryPosts.length === 0 ? (
              <p>임시 저장된 글이 없습니다.</p>
            ) : (
              temporaryPosts.map((post) => (
                <TemporaryPostItem
                  key={post.id}
                  onClick={() => loadTemporaryPost(post.id)}
                >
                  <div>
                    <strong>{post.title}</strong>
                    <p>{post.tags}</p>
                    <small>
                      작성일: {new Date(post.updated_at).toLocaleString()}
                    </small>
                  </div>
                  <DeleteButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTemporary(post.id);
                    }}
                  >
                    삭제
                  </DeleteButton>
                </TemporaryPostItem>
              ))
            )}
            <button
              onClick={closeLoadModal}
              style={{ marginTop: '10px', padding: '5px 10px' }}
            >
              닫기
            </button>
          </ModalContent>
        </ModalBackground>
      )}

      {/* 카테고리 선택 모달 */}
      {showCategoryModal && (
        <ModalBackground onClick={closeCategoryModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h2>카테고리 선택</h2>
            {categories.length === 0 ? (
              <p>카테고리가 없습니다.</p>
            ) : (
              <div>
                {categories.map((cat) => (
                  <CategoryItemModal
                    key={cat.id}
                    selected={selectedCategoryId === cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                  >
                    {cat.name}
                  </CategoryItemModal>
                ))}
              </div>
            )}
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <ConfirmButton
                onClick={confirmSave}
                disabled={!selectedCategoryId}
              >
                확인
              </ConfirmButton>
              <CancelButton onClick={closeCategoryModal}>취소</CancelButton>
            </div>
          </ModalContent>
        </ModalBackground>
      )}

      {/* 알림 메시지 */}
      {notification.message && (
        <Notification error={notification.error}>
          {notification.message}
        </Notification>
      )}
    </>
  );
}

export default Write;
