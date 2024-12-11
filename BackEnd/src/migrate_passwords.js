// migrate_passwords.js
const db = require('../src/config/db'); // db.js의 경로를 정확히 지정
const bcrypt = require('bcrypt');

async function migratePasswords() {
  try {
    // 모든 사용자 가져오기
    const [users] = await db.userPool.query('SELECT id, password FROM users');

    for (const user of users) {
      const { id, password } = user;

      // 비밀번호가 이미 해싱되어 있는지 확인 (예: bcrypt 해시는 $2b$로 시작)
      if (password.startsWith('$2b$') || password.startsWith('$2a$') || password.startsWith('$2y$')) {
        console.log(`사용자 ID ${id}의 비밀번호는 이미 해싱되어 있습니다.`);
        continue; // 이미 해싱된 비밀번호는 건너뜀
      }

      // 비밀번호 해싱
      const hashedPassword = await bcrypt.hash(password, 10); // 10은 saltRounds

      // 데이터베이스 업데이트
      await db.userPool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);

      console.log(`사용자 ID ${id}의 비밀번호가 해싱되었습니다.`);
    }

    console.log('모든 비밀번호가 성공적으로 마이그레이션되었습니다.');
    process.exit(0);
  } catch (error) {
    console.error('비밀번호 마이그레이션 중 오류 발생:', error);
    process.exit(1);
  }
}

migratePasswords();
