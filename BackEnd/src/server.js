// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet'); // 보안 헤더 설정
const rateLimit = require('express-rate-limit'); // Rate Limiting
const bcrypt = require('bcrypt'); // 비밀번호 해싱
const jwt = require('jsonwebtoken'); // JWT
const cookieParser = require('cookie-parser'); // 쿠키 파서
const db = require('./config/db'); // db.js 경로 (상대경로 수정)

require('dotenv').config(); // 환경 변수 로드

const app = express();

// JWT 설정
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

// 클라이언트 도메인 설정 (환경 변수 또는 기본값)
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:9090';

// 허용할 Origin 목록을 환경 변수에서 로드하고 배열로 변환
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [];

// ngrok 도메인 패턴을 위한 정규 표현식
const ngrokPattern = /^https?:\/\/.*\.ngrok(?:-free)?\.app$/;

// Middleware 설정
app.use(helmet());

app.use(cors({
  origin: function (origin, callback) {
    // 브라우저 외의 환경에서 오는 요청은 Origin이 없을 수 있음
    if (!origin) {
      console.log('CORS: No Origin (non-browser request)');
      return callback(null, true);
    }

    console.log(`CORS: Incoming request origin: ${origin}`);

    // 허용된 Origin인지 확인
    if (allowedOrigins.includes(origin)) {
      console.log('CORS: Allowed by ALLOWED_ORIGINS');
      return callback(null, true);
    }

    // ngrok 도메인 패턴과 일치하는지 확인
    if (ngrokPattern.test(origin)) {
      console.log('CORS: Allowed by ngrokPattern');
      return callback(null, true);
    }

    // 그 외의 Origin은 거부
    console.log('CORS: Origin not allowed');
    return callback(new Error('CORS 정책 위반'), false);
  },
  credentials: true, // 쿠키 전송 허용
}));

// 여기서 요청 본문(body) 크기 제한을 100MB로 설정
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));

app.use(cookieParser());

// Rate Limiting 설정
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // IP당 최대 100 요청
  message: '과도한 요청이 감지되었습니다. 잠시 후 다시 시도해주세요.',
});
app.use(limiter);

// JWT 인증 미들웨어
const authenticate = (req, res, next) => {
  const token = req.cookies.authToken;

  if (!token) {
    console.log('인증 실패: 토큰이 없습니다.');
    return res.status(401).json({ message: '인증이 필요합니다.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // 사용자 정보를 req 객체에 추가
    console.log(`인증 성공: 사용자 ID ${req.user.id}, 사용자명 ${req.user.username}`);
    next();
  } catch (error) {
    console.log('인증 실패: 유효하지 않은 토큰입니다.');
    return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

// -----------------------
//       Auth & User
// -----------------------

// 로그인 API (JWT 발급 및 쿠키 설정)
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  // 입력값 검증
  if (!username || !password) {
    return res.status(400).json({ message: '아이디와 비밀번호를 입력하세요.' });
  }

  try {
    // 사용자 정보 조회
    const [rows] = await db.userPool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      console.log(`로그인 실패: ${username} (존재하지 않는 사용자)`);
      return res.status(401).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
    }

    const user = rows[0];
    console.log(`조회된 사용자: ${user.username}, 비밀번호: ${user.password}`);

    // 비밀번호 비교
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`비밀번호 일치 여부: ${isMatch}`);

    if (!isMatch) {
      console.log(`로그인 실패: ${username} (잘못된 비밀번호)`);
      return res.status(401).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
    }

    console.log(`로그인 성공: ${username}`);

    // JWT 생성
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // JWT 로그 출력
    console.log(`발급된 JWT: ${token}`);

    // 쿠키 설정 (HTTP-Only)
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3 * 60 * 60 * 1000, // 3시간
    });

    // 비밀번호 필드 제외
    const { password: pwd, ...userWithoutPassword } = user;
    res.status(200).json({ message: '로그인 성공', user: userWithoutPassword });
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 로그아웃 API
app.post('/api/logout', (req, res) => {
  res.clearCookie('authToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.status(200).json({ message: '로그아웃 성공' });
});

// 인증된 사용자 정보를 반환하는 API 엔드포인트
const protectedRoutes = express.Router();
protectedRoutes.use(authenticate);

protectedRoutes.get('/user', async (req, res) => {
  try {
    const { id, username } = req.user;
    res.status(200).json({ id, username });
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    res.status(500).json({ message: '사용자 정보를 조회하는 중 오류가 발생했습니다.' });
  }
});

// -----------------------
//       Categories
// -----------------------

// 카테고리 조회 (인증 불필요)
app.get('/api/categories', async (req, res) => {
  try {
    console.log('카테고리 조회 요청 수신');
    const [rows] = await db.categoryPool.query('SELECT * FROM categories ORDER BY created_at DESC');
    console.log(`조회된 카테고리 수: ${rows.length}`);
    res.status(200).json({ categories: rows });
  } catch (error) {
    console.error('카테고리 조회 오류:', error);
    res.status(500).json({ message: '카테고리를 조회하는 중 오류가 발생했습니다.' });
  }
});

// 카테고리 추가 (인증 필요)
protectedRoutes.post('/categories', async (req, res) => {
  const { name } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ message: '카테고리 이름을 입력하세요.' });
  }

  try {
    const [result] = await db.categoryPool.query('INSERT INTO categories (name) VALUES (?)', [name.trim()]);
    console.log(`카테고리 추가: ${name}`);
    res
      .status(201)
      .json({ message: '카테고리가 추가되었습니다.', category: { id: result.insertId, name: name.trim() } });
  } catch (error) {
    console.error('카테고리 추가 오류:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ message: '이미 존재하는 카테고리입니다.' });
    } else {
      res.status(500).json({ message: '카테고리를 추가하는 중 오류가 발생했습니다.' });
    }
  }
});

// 카테고리 삭제 (인증 필요)
protectedRoutes.delete('/categories/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: '카테고리 ID를 입력하세요.' });
  }

  try {
    const [result] = await db.categoryPool.query('DELETE FROM categories WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '삭제할 카테고리를 찾을 수 없습니다.' });
    }

    console.log(`카테고리 삭제: ID ${id}`);
    res.status(200).json({ message: '카테고리가 삭제되었습니다.' });
  } catch (error) {
    console.error('카테고리 삭제 오류:', error);
    res.status(500).json({ message: '카테고리를 삭제하는 중 오류가 발생했습니다.' });
  }
});

// -----------------------
//    Temporary Posts
// -----------------------

protectedRoutes.post('/temporary_posts', async (req, res) => {
  const { title, tags, content } = req.body;
  const serverUserId = req.user.id;

  if (!title || !content) {
    return res.status(400).json({ message: '제목과 내용을 모두 입력하세요.' });
  }

  try {
    const [result] = await db.temporaryPool.query(
      'INSERT INTO temporary_posts (user_id, title, tags, content) VALUES (?, ?, ?, ?)',
      [serverUserId, title.trim(), tags ? tags.trim() : null, content.trim()]
    );
    console.log(`임시 저장 글 추가: 사용자 ID ${serverUserId}, 글 ID ${result.insertId}`);
    res
      .status(201)
      .json({ message: '임시 저장이 완료되었습니다.', temporary_post: { id: result.insertId, title, tags, content } });
  } catch (error) {
    console.error('임시 저장 오류:', error);
    res.status(500).json({ message: '임시 저장 중 오류가 발생했습니다.' });
  }
});

protectedRoutes.get('/temporary_posts', async (req, res) => {
  const serverUserId = req.user.id;

  try {
    const [rows] = await db.temporaryPool.query(
      'SELECT id, title, tags, created_at, updated_at FROM temporary_posts WHERE user_id = ? ORDER BY updated_at DESC',
      [serverUserId]
    );
    res.status(200).json({ temporary_posts: rows });
  } catch (error) {
    console.error('임시 저장 글 목록 조회 오류:', error);
    res.status(500).json({ message: '임시 저장 글 목록을 조회하는 중 오류가 발생했습니다.' });
  }
});

protectedRoutes.get('/temporary_posts/:id', async (req, res) => {
  const { id } = req.params;
  const serverUserId = req.user.id;

  if (!id) {
    return res.status(400).json({ message: '임시 저장 글 ID를 입력하세요.' });
  }

  try {
    const [rows] = await db.temporaryPool.query(
      'SELECT id, title, tags, content, created_at, updated_at FROM temporary_posts WHERE id = ? AND user_id = ?',
      [id, serverUserId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: '해당 임시 저장 글을 찾을 수 없습니다.' });
    }

    res.status(200).json({ temporary_post: rows[0] });
  } catch (error) {
    console.error('특정 임시 저장 글 조회 오류:', error);
    res.status(500).json({ message: '임시 저장 글을 조회하는 중 오류가 발생했습니다.' });
  }
});

protectedRoutes.delete('/temporary_posts/:id', async (req, res) => {
  const { id } = req.params;
  const serverUserId = req.user.id;

  if (!id) {
    return res.status(400).json({ message: '임시 저장 글 ID를 입력하세요.' });
  }

  try {
    const [result] = await db.temporaryPool.query(
      'DELETE FROM temporary_posts WHERE id = ? AND user_id = ?',
      [id, serverUserId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '삭제할 임시 저장 글을 찾을 수 없습니다.' });
    }

    console.log(`임시 저장 글 삭제: 사용자 ID ${serverUserId}, 글 ID ${id}`);
    res.status(200).json({ message: '임시 저장 글이 삭제되었습니다.' });
  } catch (error) {
    console.error('임시 저장 글 삭제 오류:', error);
    res.status(500).json({ message: '임시 저장 글을 삭제하는 중 오류가 발생했습니다.' });
  }
});

// -----------------------
//    Complete Posts
// -----------------------

// 새 글 저장 (인증 필요)
protectedRoutes.post('/complete_posts', async (req, res) => {
  const { title, tags, content, category_id } = req.body;
  const serverUserId = req.user.id;

  if (!title || !content || !category_id) {
    return res.status(400).json({ message: '제목, 내용, 카테고리를 모두 입력하세요.' });
  }

  try {
    // 카테고리 존재 여부 확인
    const [categoryRows] = await db.categoryPool.query('SELECT * FROM categories WHERE id = ?', [category_id]);
    if (categoryRows.length === 0) {
      return res.status(400).json({ message: '유효하지 않은 카테고리입니다.' });
    }

    const [result] = await db.completeStoragePool.query(
      'INSERT INTO posts (user_id, title, tags, content, category_id) VALUES (?, ?, ?, ?, ?)',
      [serverUserId, title.trim(), tags ? tags.trim() : null, content.trim(), category_id]
    );

    console.log(`글 저장 성공: 사용자 ID ${serverUserId}, 글 ID ${result.insertId}, 제목 "${title}"`);
    res.status(201).json({
      message: '글이 저장되었습니다.',
      post: { id: result.insertId, user_id: serverUserId, title, tags, content, category_id },
    });
  } catch (error) {
    console.error('완전 저장 글 추가 오류:', error);
    res.status(500).json({ message: '글을 저장하는 중 오류가 발생했습니다.' });
  }
});

// 모든 완전 저장 글 가져오기 (인증 불필요)
app.get('/api/posts', async (req, res) => {
  try {
    console.log('완전 저장 글 조회 요청 수신');
    const [rows] = await db.completeStoragePool.query(`
      SELECT posts.id, posts.title, posts.tags, posts.content, posts.created_at, 
             posts.category_id, category_db.categories.name AS category_name,
             posts.user_id
      FROM posts
      JOIN category_db.categories ON posts.category_id = category_db.categories.id
      ORDER BY posts.created_at DESC
    `);
    console.log(`조회된 게시물 수: ${rows.length}`);
    res.status(200).json({ posts: rows });
  } catch (error) {
    console.error('게시물 조회 오류:', error);
    res.status(500).json({ message: '게시물을 조회하는 중 오류가 발생했습니다.' });
  }
});

// 특정 포스트 조회 API (인증 불필요)
app.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: '포스트 ID를 입력하세요.' });
  }

  try {
    console.log(`특정 포스트 조회 요청 수신: ID ${id}`);
    const [rows] = await db.completeStoragePool.query(
      `
      SELECT posts.id, posts.title, posts.tags, posts.content, posts.created_at, 
             posts.category_id, category_db.categories.name AS category_name,
             posts.user_id
      FROM posts
      JOIN category_db.categories ON posts.category_id = category_db.categories.id
      WHERE posts.id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: '포스트를 찾을 수 없습니다.' });
    }

    res.status(200).json({ post: rows[0] });
  } catch (error) {
    console.error('특정 포스트 조회 오류:', error);
    res.status(500).json({ message: '포스트를 조회하는 중 오류가 발생했습니다.' });
  }
});

// 게시물 삭제 API (인증 필요)
protectedRoutes.delete('/posts/:id', async (req, res) => {
  const { id } = req.params;
  const serverUserId = req.user.id;

  if (!id) {
    return res.status(400).json({ message: '게시물 ID를 입력하세요.' });
  }

  try {
    // 로그인한 사용자 본인이 쓴 게시물인지 확인
    const [findRows] = await db.completeStoragePool.query(
      'SELECT * FROM posts WHERE id = ? AND user_id = ?',
      [id, serverUserId]
    );

    if (findRows.length === 0) {
      return res.status(404).json({ message: '삭제할 게시물을 찾을 수 없거나 권한이 없습니다.' });
    }

    // 삭제
    await db.completeStoragePool.query('DELETE FROM posts WHERE id = ?', [id]);
    console.log(`게시물 삭제: 사용자 ID ${serverUserId}, 글 ID ${id}`);
    res.status(200).json({ message: '게시물이 삭제되었습니다.' });
  } catch (error) {
    console.error('게시물 삭제 오류:', error);
    res.status(500).json({ message: '게시물을 삭제하는 중 오류가 발생했습니다.' });
  }
});

// 게시물 수정 API (인증 필요)
protectedRoutes.put('/posts/:id', async (req, res) => {
  const { id } = req.params;
  const { title, tags, content, category_id } = req.body;
  const serverUserId = req.user.id;

  if (!id) {
    return res.status(400).json({ message: '게시물 ID를 입력하세요.' });
  }
  if (!title || !content || !category_id) {
    return res.status(400).json({ message: '제목, 내용, 카테고리를 모두 입력하세요.' });
  }

  try {
    // 해당 게시물이 로그인한 사용자의 게시물이 맞는지 확인
    const [findRows] = await db.completeStoragePool.query(
      'SELECT * FROM posts WHERE id = ? AND user_id = ?',
      [id, serverUserId]
    );

    if (findRows.length === 0) {
      return res.status(404).json({ message: '수정할 게시물을 찾을 수 없거나 권한이 없습니다.' });
    }

    // 카테고리 존재 여부 확인
    const [categoryRows] = await db.categoryPool.query('SELECT * FROM categories WHERE id = ?', [category_id]);
    if (categoryRows.length === 0) {
      return res.status(400).json({ message: '유효하지 않은 카테고리입니다.' });
    }

    // 업데이트
    await db.completeStoragePool.query(
      'UPDATE posts SET title = ?, tags = ?, content = ?, category_id = ? WHERE id = ?',
      [title.trim(), tags ? tags.trim() : null, content.trim(), category_id, id]
    );

    console.log(`게시물 수정: 사용자 ID ${serverUserId}, 글 ID ${id}`);
    res.status(200).json({ message: '게시물이 수정되었습니다.' });
  } catch (error) {
    console.error('게시물 수정 오류:', error);
    res.status(500).json({ message: '게시물을 수정하는 중 오류가 발생했습니다.' });
  }
});

// 보호된 라우트들을 /api 하위에 추가
app.use('/api', protectedRoutes);

// 서버 실행
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`서버가 ${CLIENT_ORIGIN}에서 실행 중입니다. 포트: http://localhost:${PORT}`);
});
