// src/config/db.js
const mysql = require('mysql2');

// user_db용 커넥션 풀 생성
const userPool = mysql.createPool({
  host: 'localhost',        // MySQL 서버 주소
  user: 'admin',            // MySQL 사용자 이름
  password: '15881588',     // MySQL 사용자 비밀번호
  database: 'user_db'       // 사용할 데이터베이스 이름
});

// category_db용 커넥션 풀 생성
const categoryPool = mysql.createPool({
  host: 'localhost',
  user: 'admin',
  password: '15881588',
  database: 'category_db'    // 기존 카테고리 데이터베이스
});

// temporary_storage_db용 커넥션 풀 생성
const temporaryPool = mysql.createPool({
  host: 'localhost',
  user: 'admin',
  password: '15881588',
  database: 'temporary_storage_db' // 기존 임시 저장 데이터베이스
});

// complete_storage_db용 커넥션 풀 생성
const completeStoragePool = mysql.createPool({
  host: 'localhost',
  user: 'admin',
  password: '15881588',
  database: 'complete_storage_db' // 새로 생성한 데이터베이스
});

// 프로미스 기반으로 사용 설정 및 내보내기
module.exports = {
  userPool: userPool.promise(),
  categoryPool: categoryPool.promise(),
  temporaryPool: temporaryPool.promise(),
  completeStoragePool: completeStoragePool.promise() // 추가된 풀
};
