-- root 사용자 비밀번호 설정
ALTER USER 'root'@'%' IDENTIFIED BY '1743';

-- admin 사용자 생성 (이미 존재할 경우 무시)
CREATE USER IF NOT EXISTS 'admin'@'%' IDENTIFIED BY '15881588';

-- admin 사용자에게 권한 부여
GRANT ALL PRIVILEGES ON *.* TO 'admin'@'%' WITH GRANT OPTION;

-- 변경 사항 적용
FLUSH PRIVILEGES;

-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS category_db;
CREATE DATABASE IF NOT EXISTS temporary_storage_db;
CREATE DATABASE IF NOT EXISTS complete_storage_db;
CREATE DATABASE IF NOT EXISTS user_db;

-- 데이터베이스 사용 설정 및 테이블 생성

-- user_db 데이터베이스
USE user_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- category_db 데이터베이스
USE category_db;

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- temporary_storage_db 데이터베이스
USE temporary_storage_db;

CREATE TABLE IF NOT EXISTS temporary_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    tags VARCHAR(255),
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_db.users(id) ON DELETE CASCADE
);

-- complete_storage_db 데이터베이스
USE complete_storage_db;

CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    tags VARCHAR(255),
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_db.users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES category_db.categories(id) ON DELETE CASCADE
);
