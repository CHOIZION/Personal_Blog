// server.js
require('dotenv').config(); // 환경 변수 로드
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet'); // Helmet 추가
const rateLimit = require('express-rate-limit'); // Rate Limiting 추가
const bcrypt = require('bcrypt'); // 비밀번호 해싱을 위한 bcrypt 추가
const db = require('../src/config/db'); // db.js의 경로를 정확히 지정

const app = express();

// Middleware 설정
app.use(helmet()); // 보안 헤더 설정
app.use(cors()); // CORS 설정 (추후 필요시 세부 설정 권장)
app.use(bodyParser.json());

// Rate Limiting 설정 (예: IP당 100개의 요청을 15분 동안 허용)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // IP당 최대 100개의 요청
  message: '과도한 요청이 감지되었습니다. 잠시 후 다시 시도해주세요.',
  standardHeaders: true, // Rate limit 정보를 `RateLimit-*` 헤더에 포함
  legacyHeaders: false, // `X-RateLimit-*` 헤더 비활성화
});
app.use(limiter);

// 로그인 API (비밀번호 해싱 적용)
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  // 입력값 검증
  if (!username || !password) {
    return res.status(400).json({ message: '아이디와 비밀번호를 입력하세요.' });
  }

  try {
    // 사용자 정보 조회 (비밀번호 포함)
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

    console.log(`로그인 성공: ${username}`); // 터미널에 로그인 성공 메시지 출력
    // 비밀번호 필드 제외
    const { password: pwd, ...userWithoutPassword } = user;
    res.status(200).json({ message: '로그인 성공', user: userWithoutPassword });
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 카테고리 조회 API (기존 코드 유지)
app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await db.categoryPool.query('SELECT * FROM categories ORDER BY created_at DESC');
    res.status(200).json({ categories: rows });
  } catch (error) {
    console.error('카테고리 조회 오류:', error);
    res.status(500).json({ message: '카테고리를 조회하는 중 오류가 발생했습니다.' });
  }
});

// 카테고리 추가 API (기존 코드 유지)
app.post('/api/categories', async (req, res) => {
  const { name } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ message: '카테고리 이름을 입력하세요.' });
  }

  try {
    const [result] = await db.categoryPool.query('INSERT INTO categories (name) VALUES (?)', [name.trim()]);
    console.log(`카테고리 추가: ${name}`);
    res.status(201).json({ message: '카테고리가 추가되었습니다.', category: { id: result.insertId, name: name.trim() } });
  } catch (error) {
    console.error('카테고리 추가 오류:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ message: '이미 존재하는 카테고리입니다.' });
    } else {
      res.status(500).json({ message: '카테고리를 추가하는 중 오류가 발생했습니다.' });
    }
  }
});

// 카테고리 삭제 API (기존 코드 유지)
app.delete('/api/categories/:id', async (req, res) => {
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

// 임시 저장 글 생성 (임시 저장)
app.post('/api/temporary_posts', async (req, res) => {
  const { user_id, title, tags, content } = req.body;

  if (!user_id || !title || !content) {
    return res.status(400).json({ message: '사용자 ID, 제목, 내용을 모두 입력하세요.' });
  }

  try {
    const [result] = await db.temporaryPool.query(
      'INSERT INTO temporary_posts (user_id, title, tags, content) VALUES (?, ?, ?, ?)',
      [user_id, title.trim(), tags ? tags.trim() : null, content.trim()]
    );
    console.log(`임시 저장 글 추가: ID ${result.insertId}`);
    res.status(201).json({ message: '임시 저장이 완료되었습니다.', temporary_post: { id: result.insertId, title, tags, content } });
  } catch (error) {
    console.error('임시 저장 오류:', error);
    res.status(500).json({ message: '임시 저장 중 오류가 발생했습니다.' });
  }
});

// 임시 저장 글 목록 조회
app.get('/api/temporary_posts', async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ message: '사용자 ID를 입력하세요.' });
  }

  try {
    const [rows] = await db.temporaryPool.query(
      'SELECT id, title, tags, created_at, updated_at FROM temporary_posts WHERE user_id = ? ORDER BY updated_at DESC',
      [user_id]
    );
    res.status(200).json({ temporary_posts: rows });
  } catch (error) {
    console.error('임시 저장 글 목록 조회 오류:', error);
    res.status(500).json({ message: '임시 저장 글 목록을 조회하는 중 오류가 발생했습니다.' });
  }
});

// 특정 임시 저장 글 조회
app.get('/api/temporary_posts/:id', async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.query;

  if (!id || !user_id) {
    return res.status(400).json({ message: '임시 저장 글 ID와 사용자 ID를 입력하세요.' });
  }

  try {
    const [rows] = await db.temporaryPool.query(
      'SELECT id, title, tags, content, created_at, updated_at FROM temporary_posts WHERE id = ? AND user_id = ?',
      [id, user_id]
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

// 임시 저장 글 삭제
app.delete('/api/temporary_posts/:id', async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.query;

  if (!id || !user_id) {
    return res.status(400).json({ message: '임시 저장 글 ID와 사용자 ID를 입력하세요.' });
  }

  try {
    const [result] = await db.temporaryPool.query(
      'DELETE FROM temporary_posts WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '삭제할 임시 저장 글을 찾을 수 없습니다.' });
    }

    console.log(`임시 저장 글 삭제: ID ${id}`);
    res.status(200).json({ message: '임시 저장 글이 삭제되었습니다.' });
  } catch (error) {
    console.error('임시 저장 글 삭제 오류:', error);
    res.status(500).json({ message: '임시 저장 글을 삭제하는 중 오류가 발생했습니다.' });
  }
});

// 완전 저장 글 생성 (완전 저장)
app.post('/api/complete_posts', async (req, res) => {
  const { user_id, title, tags, content, category_id } = req.body;

  if (!user_id || !title || !content || !category_id) {
    return res.status(400).json({ message: '사용자 ID, 제목, 내용, 카테고리를 모두 입력하세요.' });
  }

  try {
    // 카테고리 존재 여부 확인
    const [categoryRows] = await db.categoryPool.query('SELECT * FROM categories WHERE id = ?', [category_id]);
    if (categoryRows.length === 0) {
      return res.status(400).json({ message: '유효하지 않은 카테고리입니다.' });
    }

    const [result] = await db.completeStoragePool.query(
      'INSERT INTO posts (user_id, title, tags, content, category_id) VALUES (?, ?, ?, ?, ?)',
      [user_id, title.trim(), tags ? tags.trim() : null, content.trim(), category_id]
    );

    console.log(`완전 저장 글 추가: ID ${result.insertId}`);
    res.status(201).json({ message: '글이 저장되었습니다.', post: { id: result.insertId, user_id, title, tags, content, category_id } });
  } catch (error) {
    console.error('완전 저장 글 추가 오류:', error);
    res.status(500).json({ message: '글을 저장하는 중 오류가 발생했습니다.' });
  }
});

// 모든 완전 저장 글 가져오기
app.get('/api/posts', async (req, res) => {
  try {
    const [rows] = await db.completeStoragePool.query(`
      SELECT posts.id, posts.title, posts.tags, posts.content, posts.created_at, 
             posts.category_id, category_db.categories.name AS category_name
      FROM posts
      JOIN category_db.categories ON posts.category_id = category_db.categories.id
      ORDER BY posts.created_at DESC
    `);
    res.status(200).json({ posts: rows });
  } catch (error) {
    console.error('게시물 조회 오류:', error);
    res.status(500).json({ message: '게시물을 조회하는 중 오류가 발생했습니다.' });
  }
});

// 특정 포스트 조회 API 추가
app.get('/api/posts/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: '포스트 ID를 입력하세요.' });
  }

  try {
    const [rows] = await db.completeStoragePool.query(`
      SELECT posts.id, posts.title, posts.tags, posts.content, posts.created_at, 
             posts.category_id, category_db.categories.name AS category_name
      FROM posts
      JOIN category_db.categories ON posts.category_id = category_db.categories.id
      WHERE posts.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: '포스트를 찾을 수 없습니다.' });
    }

    res.status(200).json({ post: rows[0] });
  } catch (error) {
    console.error('특정 포스트 조회 오류:', error);
    res.status(500).json({ message: '포스트를 조회하는 중 오류가 발생했습니다.' });
  }
});

// 게시물 삭제 API 추가 (기존 코드 유지)
app.delete('/api/posts/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: '게시물 ID를 입력하세요.' });
  }

  try {
    const [result] = await db.completeStoragePool.query('DELETE FROM posts WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '삭제할 게시물을 찾을 수 없습니다.' });
    }

    console.log(`게시물 삭제: ID ${id}`);
    res.status(200).json({ message: '게시물이 삭제되었습니다.' });
  } catch (error) {
    console.error('게시물 삭제 오류:', error);
    res.status(500).json({ message: '게시물을 삭제하는 중 오류가 발생했습니다.' });
  }
});

// 서버 실행
const PORT = process.env.PORT || 5000; // 환경 변수 사용
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
