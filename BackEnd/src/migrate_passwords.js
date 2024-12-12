const bcrypt = require('bcrypt');
const password = 'kokokoko04!'; // 평문 비밀번호

bcrypt.hash(password, 10, (err, hashedPassword) => {
  if (err) throw err;
  console.log('해싱된 비밀번호:', hashedPassword);

  // 이 값을 SQL에 넣습니다.
  // 예: INSERT INTO users (username, password) VALUES ('czion04', hashedPassword);
});
