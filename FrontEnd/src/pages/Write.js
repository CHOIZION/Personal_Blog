// src/pages/Write.js
import React, { useRef, useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';

// Styled Components (기존 코드 유지)
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
  height: 100vh; /* 화면 전체 높이 */
  padding: 20px;
  box-sizing: border-box;
  font-family: Arial, sans-serif;
  border: 1px solid #ddd;
  background: #f0f0f0; /* 전체 배경을 연한 회색으로 변경 */
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
    content: "소제목을 입력하세요.";
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
  overflow-y: auto; /* 스크롤 가능하게 설정 */
  background: #f0f0f0; /* 배경색을 연한 회색으로 설정 */
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

// Button Container for Save Buttons
const SaveButtonsContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
`;

// Save, Load, and Save as Buttons
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

// Modal Background
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

// Modal Content
const ModalContent = styled.div`
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-height: 80%;
  overflow-y: auto;
`;

// Temporary Post Item
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

// Delete Button
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

// Category Selection Modal Components
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

// Notification Message
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

function Write() {
  const contentRef = useRef(null);
  const fileInputRef = useRef(null);
  const titleRef = useRef(null);
  const tagRef = useRef(null);

  // 사용자 정보 상태
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const user_id = user ? user.id : null;

  const [showLinkPopup, setShowLinkPopup] = useState(false);
  const [linkURL, setLinkURL] = useState('');
  const [savedSelection, setSavedSelection] = useState(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const [resizing, setResizing] = useState(false);
  const [startX, setStartX] = useState(null);
  const [startWidth, setStartWidth] = useState(null);

  const [resizerPos, setResizerPos] = useState({ top: 0, left: 0 });

  const [showLoadModal, setShowLoadModal] = useState(false);
  const [temporaryPosts, setTemporaryPosts] = useState([]);
  const [notification, setNotification] = useState({ message: '', error: false });

  // 카테고리 저장 상태
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // 커서 혹은 선택 상태 저장
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

  const applyHeading = (heading) => {
    document.execCommand('formatBlock', false, heading);
  };

  const makeBold = () => {
    document.execCommand('bold', false, null);
  };

  const insertImage = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
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

  const insertLink = () => {
    // 링크 삽입 버튼을 누르는 시점에 현재 선택 영역을 저장
    const range = saveSelectionState();
    setSavedSelection(range);
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

  // 이미지 선택 시 선택 상태 반영
  const handleContentClick = (e) => {
    if (e.target.tagName === 'IMG') {
      // 이미지 선택
      setSelectedImage(e.target);
    } else if (e.target.tagName === 'A') {
      // 링크 클릭 시 새 탭에서 열기
      e.preventDefault();
      const href = e.target.getAttribute('href');
      if (href) {
        window.open(href, '_blank');
      }
    } else {
      setSelectedImage(null);
    }
  };

  // 키보드 이벤트: 이미지 선택 중 Delete/Backspace 누르면 이미지 삭제
  const handleKeyDown = (e) => {
    if (selectedImage && (e.key === 'Delete' || e.key === 'Backspace')) {
      e.preventDefault();
      selectedImage.remove();
      setSelectedImage(null);
    }
  };

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    el.addEventListener('click', handleContentClick);
    el.addEventListener('keydown', handleKeyDown);

    // Click outside to deselect image
    const handleClickOutside = (e) => {
      if (el && !el.contains(e.target)) {
        setSelectedImage(null);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      el.removeEventListener('click', handleContentClick);
      el.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [selectedImage]);

  // 이미지 리사이즈 핸들 표시
  useEffect(() => {
    if (selectedImage && contentRef.current) {
      const imageRect = selectedImage.getBoundingClientRect();
      const containerRect = contentRef.current.getBoundingClientRect();

      setResizerPos({
        top: imageRect.bottom - containerRect.top + contentRef.current.scrollTop - 6, // Adjust to position handle
        left: imageRect.right - containerRect.left + contentRef.current.scrollLeft - 6,
      });

      selectedImage.classList.add('selected');
    } else {
      if (contentRef.current) {
        const imgs = contentRef.current.querySelectorAll('img');
        imgs.forEach((img) => img.classList.remove('selected'));
      }
      setResizerPos({ top: 0, left: 0 });
    }
  }, [selectedImage]);

  const startResize = (e) => {
    if (!selectedImage) return;
    e.preventDefault();
    setResizing(true);
    setStartX(e.clientX);
    setStartWidth(selectedImage.width);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!resizing || !selectedImage) return;
      e.preventDefault();
      const diffX = e.clientX - startX;
      const newWidth = startWidth + diffX;
      if (newWidth > 50) {
        selectedImage.width = newWidth;
        // 리사이저 위치 업데이트
        const imageRect = selectedImage.getBoundingClientRect();
        const containerRect = contentRef.current.getBoundingClientRect();
        setResizerPos({
          top: imageRect.bottom - containerRect.top + contentRef.current.scrollTop - 6,
          left: imageRect.right - containerRect.left + contentRef.current.scrollLeft - 6,
        });
        setStartX(e.clientX); // Update startX for continuous resizing
        setStartWidth(newWidth); // Update startWidth for continuous resizing
      }
    };

    const handleMouseUp = () => {
      setResizing(false);
    };

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
  }, [resizing, startX, startWidth, selectedImage]);

  // 이미지 리사이즈 핸들의 위치를 다시 계산하기 위해 스크롤 시 리사이저 위치 업데이트
  useEffect(() => {
    const handleScroll = () => {
      if (selectedImage && contentRef.current) {
        const imageRect = selectedImage.getBoundingClientRect();
        const containerRect = contentRef.current.getBoundingClientRect();

        setResizerPos({
          top: imageRect.bottom - containerRect.top + contentRef.current.scrollTop - 6,
          left: imageRect.right - containerRect.left + contentRef.current.scrollLeft - 6,
        });
      }
    };

    if (contentRef.current) {
      contentRef.current.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (contentRef.current) {
        contentRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, [selectedImage]);

  // 임시 저장 기능
  const handleTemporarySave = async () => {
    if (!user_id) {
      setNotification({ message: '로그인이 필요합니다.', error: true });
      return;
    }

    const title = titleRef.current.innerText.trim();
    const tags = tagRef.current.innerText.trim();
    const content = contentRef.current.innerHTML.trim();

    if (!title || !content) {
      setNotification({ message: '제목과 내용을 모두 입력하세요.', error: true });
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/temporary_posts`, {
        method: 'POST',
        credentials: 'include', // 쿠키 전송
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, tags, content })
      });

      if (response.ok) {
        const data = await response.json();
        setNotification({ message: '임시 저장이 완료되었습니다.', error: false });
        console.log('임시 저장 성공:', data);
      } else {
        const errorData = await response.json();
        setNotification({ message: errorData.message || '임시 저장 중 오류가 발생했습니다.', error: true });
      }
    } catch (error) {
      console.error('임시 저장 오류:', error);
      setNotification({ message: '임시 저장 중 오류가 발생했습니다.', error: true });
    }
  };

  // 불러오기 기능
  const handleLoad = async () => {
    if (!user_id) {
      setNotification({ message: '로그인이 필요합니다.', error: true });
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/temporary_posts`, {
        method: 'GET',
        credentials: 'include', // 쿠키 전송
        headers: {
          'Content-Type': 'application/json'
        }
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

  // 특정 임시 저장 글 불러오기
  const loadTemporaryPost = async (id) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/temporary_posts/${id}`, {
        method: 'GET',
        credentials: 'include', // 쿠키 전송
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const { title, tags, content } = data.temporary_post;

        // 제목, 태그, 내용 업데이트
        if (titleRef.current && tagRef.current && contentRef.current) {
          titleRef.current.innerText = title;
          tagRef.current.innerText = tags || '';
          contentRef.current.innerHTML = content;
        }

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

  // 특정 임시 저장 글 삭제
  const handleDelete = async (id) => {
    if (!window.confirm('정말로 이 임시 저장 글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/temporary_posts/${id}`, {
        method: 'DELETE',
        credentials: 'include', // 쿠키 전송
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // 삭제된 글을 temporaryPosts 상태에서 제거
        setTemporaryPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
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

  // "저장하기" 버튼 클릭 시 카테고리 목록 불러오기 및 모달 열기
  const handleSave = async () => {
    if (!user_id) {
      setNotification({ message: '로그인이 필요합니다.', error: true });
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/categories`, {
        method: 'GET',
        credentials: 'include', // 쿠키 전송 (필요 시)
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
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

  // 카테고리 선택
  const handleCategorySelect = (id) => {
    setSelectedCategoryId(id);
  };

  // 카테고리 선택 확인 및 글 저장
  const confirmSave = async () => {
    if (!user_id) {
      setNotification({ message: '로그인이 필요합니다.', error: true });
      return;
    }

    const title = titleRef.current.innerText.trim();
    const tags = tagRef.current.innerText.trim();
    const content = contentRef.current.innerHTML.trim();

    if (!title || !content) {
      setNotification({ message: '제목과 내용을 모두 입력하세요.', error: true });
      return;
    }

    if (!selectedCategoryId) {
      setNotification({ message: '카테고리를 선택하세요.', error: true });
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/complete_posts`, {
        method: 'POST',
        credentials: 'include', // 쿠키 전송
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          tags,
          content,
          category_id: selectedCategoryId
        })
      });

      if (response.ok) {
        const data = await response.json();
        setNotification({ message: '글이 성공적으로 저장되었습니다.', error: false });

        // 글 작성 폼 초기화
        if (titleRef.current && tagRef.current && contentRef.current) {
          titleRef.current.innerText = '';
          tagRef.current.innerText = '';
          contentRef.current.innerHTML = '';
        }

        setShowCategoryModal(false);
        setSelectedCategoryId(null);
      } else {
        const errorData = await response.json();
        setNotification({ message: errorData.message || '글을 저장하는 중 오류가 발생했습니다.', error: true });
      }
    } catch (error) {
      console.error('글 저장 오류:', error);
      setNotification({ message: '글을 저장하는 중 오류가 발생했습니다.', error: true });
    }
  };

  // 카테고리 선택 모달 닫기
  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setSelectedCategoryId(null);
  };

  // 로드 모달 닫기
  const closeLoadModal = () => {
    setShowLoadModal(false);
  };

  // 알림 메시지 자동 사라지기
  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: '', error: false });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  // 사용자 정보 불러오기
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/user`, {
          method: 'GET',
          credentials: 'include', // 쿠키 전송
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          const errorData = await response.json();
          setAuthError(errorData.message || '사용자 정보를 불러오는 중 오류가 발생했습니다.');
        }
      } catch (error) {
        console.error('사용자 정보 불러오기 오류:', error);
        setAuthError('사용자 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // 렌더링 부분
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
        <TitleInput
          contentEditable
          suppressContentEditableWarning={true}
          ref={titleRef}
          placeholder="제목을 입력하세요."
        />
        <TagInput
          contentEditable
          suppressContentEditableWarning={true}
          ref={tagRef}
          placeholder="태그를 입력하세요."
        />
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
              <button onClick={() => { setShowLinkPopup(false); setLinkURL(''); }}>취소</button>
            </LinkPopup>
          )}
        </Toolbar>

        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        <ContentContainer>
          <ContentInput
            contentEditable
            suppressContentEditableWarning={true}
            ref={contentRef}
            // Auto height adjustment
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

        {/* 임시 저장 버튼과 저장하기 버튼, 불러오기 버튼 추가 */}
        <SaveButtonsContainer>
          <SaveButton onClick={handleTemporarySave} disabled={!user_id}>
            임시 저장
          </SaveButton>
          <SaveButton primary onClick={handleSave} disabled={!user_id}>
            저장하기
          </SaveButton>
          <SaveButton onClick={handleLoad} disabled={!user_id}>
            불러오기
          </SaveButton>
        </SaveButtonsContainer>
      </Container>

      {/* 불러오기 모달 */}
      {showLoadModal && (
        <ModalBackground onClick={closeLoadModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h2>임시 저장된 글 목록</h2>
            {temporaryPosts.length === 0 ? (
              <p>임시 저장된 글이 없습니다.</p>
            ) : (
              temporaryPosts.map((post) => (
                <TemporaryPostItem key={post.id} onClick={() => loadTemporaryPost(post.id)}>
                  <div>
                    <strong>{post.title}</strong>
                    <p>{post.tags}</p>
                    <small>작성일: {new Date(post.updated_at).toLocaleString()}</small>
                  </div>
                  <DeleteButton onClick={(e) => { e.stopPropagation(); handleDelete(post.id); }}>
                    삭제
                  </DeleteButton>
                </TemporaryPostItem>
              ))
            )}
            <button onClick={closeLoadModal} style={{ marginTop: '10px', padding: '5px 10px' }}>
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
                {categories.map((category) => (
                  <CategoryItemModal
                    key={category.id}
                    selected={selectedCategoryId === category.id}
                    onClick={() => handleCategorySelect(category.id)}
                  >
                    {category.name}
                  </CategoryItemModal>
                ))}
              </div>
            )}
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <ConfirmButton onClick={confirmSave} disabled={!selectedCategoryId}>
                확인
              </ConfirmButton>
              <CancelButton onClick={closeCategoryModal}>
                취소
              </CancelButton>
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
