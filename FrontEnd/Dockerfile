# 1단계: Node.js를 이용한 빌드
FROM node:22 AS build

# 작업 디렉토리 설정
WORKDIR /app

# .env 파일 복사 (환경 변수 설정)
COPY .env .env

# package.json과 package-lock.json 복사 후 의존성 설치
COPY package.json package-lock.json ./
RUN npm install

# 애플리케이션 소스 복사 및 빌드
COPY . .
RUN npm run build

# 2단계: Nginx를 이용한 정적 파일 서빙
FROM nginx:alpine

# 빌드 결과물을 Nginx 정적 파일 디렉토리로 복사
COPY --from=build /app/build /usr/share/nginx/html

# Nginx 기본 설정 수정 (SPA 지원을 위해)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx 컨테이너에서 노출할 포트
EXPOSE 80

# Nginx 실행 명령
CMD ["nginx", "-g", "daemon off;"]
