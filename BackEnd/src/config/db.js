// src/config/db.js
const mysql = require('mysql2');

// User DB용 커넥션 풀 생성
const userPool = mysql.createPool({
  host: process.env.USER_DB_HOST,
  user: process.env.USER_DB_USER,
  password: process.env.USER_DB_PASSWORD,
  database: process.env.USER_DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Category DB용 커넥션 풀 생성
const categoryPool = mysql.createPool({
  host: process.env.CATEGORY_DB_HOST,
  user: process.env.CATEGORY_DB_USER,
  password: process.env.CATEGORY_DB_PASSWORD,
  database: process.env.CATEGORY_DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Temporary Storage DB용 커넥션 풀 생성
const temporaryPool = mysql.createPool({
  host: process.env.TEMPORARY_DB_HOST,
  user: process.env.TEMPORARY_DB_USER,
  password: process.env.TEMPORARY_DB_PASSWORD,
  database: process.env.TEMPORARY_DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Complete Storage DB용 커넥션 풀 생성
const completeStoragePool = mysql.createPool({
  host: process.env.COMPLETE_DB_HOST,
  user: process.env.COMPLETE_DB_USER,
  password: process.env.COMPLETE_DB_PASSWORD,
  database: process.env.COMPLETE_DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// 프로미스 기반으로 사용 설정 및 내보내기
module.exports = {
  userPool: userPool.promise(),
  categoryPool: categoryPool.promise(),
  temporaryPool: temporaryPool.promise(),
  completeStoragePool: completeStoragePool.promise(),
};
