# BackEnd/Dockerfile

# 공식 Node.js 22.12.0 이미지를 사용합니다.
FROM node:22.12.0

# 앱 디렉토리 생성
WORKDIR /app

# package.json과 package-lock.json을 복사합니다.
COPY package*.json ./

# 프로덕션 의존성만 설치합니다.
RUN npm install --only=production

# 앱 소스 코드를 복사합니다.
COPY src ./

# 애플리케이션이 사용하는 포트를 노출합니다.
EXPOSE 5000

# 환경 변수를 프로덕션으로 설정합니다.
ENV NODE_ENV=production

# 애플리케이션을 시작합니다.
CMD ["node", "server.js"]
