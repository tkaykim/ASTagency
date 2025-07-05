# GRIGO ENTERTAINMENT - 관리자 페이지

GRIGO ENTERTAINMENT 크리에이티브 에이전시의 웹사이트와 관리자 페이지입니다.

## 기능

### 클라이언트 페이지
- 반응형 현대적 디자인
- 회사 소개 섹션
- 클라이언트 로고 슬라이드
- 포트폴리오 갤러리
- 연락처 정보

### 관리자 페이지
- 보안 로그인 시스템
- 고객사 관리 (한글명, 영문명, 로고 업로드)
- 포트폴리오 관리 (카테고리, 영상 링크, 클라이언트명)
- 실시간 데이터 추가/삭제

## 기술 스택

- **Backend**: Node.js, Express.js
- **Database**: Supabase (PostgreSQL)
- **Frontend**: HTML5, CSS3, JavaScript, Tailwind CSS
- **File Upload**: Multer
- **Authentication**: Express-session, bcryptjs

## 설치 및 실행

### 1. 필수 요구사항
- Node.js (v14 이상)
- npm 또는 yarn
- Supabase 계정

### 2. Supabase 프로젝트 설정
```bash
# 1. https://supabase.com 방문하여 계정 생성
# 2. "New Project" 클릭하여 새 프로젝트 생성
# 3. 프로젝트 이름: grigo-entertainment
# 4. 데이터베이스 비밀번호 설정
# 5. 지역 선택 (Asia Northeast recommended)
```

### 3. 데이터베이스 설정
```bash
# 1. Supabase 대시보드에서 "SQL Editor" 클릭
# 2. supabase-schema.sql 파일의 내용을 복사하여 붙여넣기
# 3. "Run" 버튼을 클릭하여 테이블 생성
```

### 4. 프로젝트 설정
```bash
# 의존성 설치
npm install

# 환경 변수 설정
# .env 파일에서 다음 값들을 설정:
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (선택사항)
```

### 5. 서버 실행
```bash
# 개발 모드 (nodemon 사용)
npm run dev

# 프로덕션 모드
npm start
```

### 6. 접속
- **클라이언트 페이지**: http://localhost:3000
- **관리자 페이지**: http://localhost:3000/admin
- **기본 관리자 계정**: admin / admin123

## 사용법

### 관리자 기능

#### 고객사 추가
1. 관리자 페이지 로그인
2. "고객사 관리" 섹션에서 정보 입력:
   - 고객사명 (한글)
   - 고객사명 (영문)
   - 로고 파일 (PNG, JPG, JPEG 지원)
3. "고객사 추가" 버튼 클릭

#### 포트폴리오 추가
1. "포트폴리오 관리" 섹션에서 정보 입력:
   - 협력 카테고리 선택:
     * 유튜브 브랜디드
     * 유튜브 PPL
     * 브랜드필름 제작
     * SNS 광고
     * 전속모델
   - 협력사례영상 링크 (YouTube URL)
   - 클라이언트명
2. "포트폴리오 추가" 버튼 클릭

#### 데이터 삭제
- 각 항목 옆의 휴지통 아이콘을 클릭하여 삭제
- 확인 대화상자에서 "확인" 클릭

## API 엔드포인트

### 클라이언트 API
- `GET /api/clients` - 모든 고객사 정보 조회
- `GET /api/portfolios` - 모든 포트폴리오 정보 조회

### 관리자 API (인증 필요)
- `POST /admin/clients` - 고객사 추가
- `DELETE /admin/clients/:id` - 고객사 삭제
- `POST /admin/portfolios` - 포트폴리오 추가
- `DELETE /admin/portfolios/:id` - 포트폴리오 삭제

## 파일 구조

```
grigo-entertainment/
├── server.js              # 메인 서버 파일
├── package.json           # 프로젝트 설정 및 의존성
├── .env                   # 환경 변수
├── .gitignore            # Git 제외 파일 목록
├── supabase-schema.sql   # Supabase 데이터베이스 스키마
├── index.html            # 클라이언트 메인 페이지
├── uploads/              # 업로드된 파일 저장
│   └── logos/           # 고객사 로고 파일들
├── ClientsLogo/          # 기존 로고 파일들
└── README.md             # 프로젝트 문서
```

## 환경 변수

`.env` 파일에서 다음 변수들을 설정할 수 있습니다:

```env
PORT=3000                                          # 서버 포트
SUPABASE_URL=https://your-project.supabase.co     # Supabase 프로젝트 URL
SUPABASE_ANON_KEY=your-anon-key                   # Supabase 익명 키
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # Supabase 서비스 역할 키 (선택사항)
SESSION_SECRET=your-secret-key                     # 세션 암호화 키
```

### Supabase 키 찾는 방법:
1. Supabase 대시보드에서 프로젝트 선택
2. Settings → API 클릭
3. Project URL과 Project API keys 확인
4. `anon public` 키를 SUPABASE_ANON_KEY로 사용
5. `service_role` 키를 SUPABASE_SERVICE_ROLE_KEY로 사용 (관리자 기능용)

## 보안 고려사항

1. **세션 시크릿**: 프로덕션에서는 강력한 시크릿 키 사용
2. **파일 업로드**: 이미지 파일만 허용, 5MB 크기 제한
3. **인증**: 관리자 기능은 로그인 필수
4. **입력 검증**: 필수 필드 및 URL 형식 검증

## 프로덕션 배포

### 1. 환경 변수 설정
```bash
export NODE_ENV=production
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_ANON_KEY=your-anon-key
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
export SESSION_SECRET=your-strong-secret-key
```

### 2. 프로세스 관리자 사용 (PM2 권장)
```bash
npm install -g pm2
pm2 start server.js --name "grigo-entertainment"
```

### 3. 리버스 프록시 설정 (Nginx)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 문제 해결

### Supabase 연결 실패
- .env 파일의 SUPABASE_URL과 SUPABASE_ANON_KEY 확인
- Supabase 프로젝트가 활성 상태인지 확인
- API 키가 올바른지 Supabase 대시보드에서 재확인
- 네트워크 연결 상태 확인

### 데이터베이스 테이블이 없음
- supabase-schema.sql 스크립트가 정상 실행되었는지 확인
- Supabase SQL 에디터에서 테이블 목록 확인
- RLS(Row Level Security) 정책이 올바르게 설정되었는지 확인

### 파일 업로드 실패
- uploads/logos 디렉토리 권한 확인
- 파일 크기가 5MB 이하인지 확인
- 이미지 파일 형식인지 확인

### 관리자 로그인 실패
- 기본 계정: admin / admin123
- 대소문자 정확히 입력
- 브라우저 쿠키/세션 삭제 후 재시도

## 라이센스

MIT License

## 문의

기술 지원이 필요하시면 개발팀에 문의하세요.