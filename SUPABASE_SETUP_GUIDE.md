# Supabase 설정 가이드

이 가이드는 GRIGO ENTERTAINMENT 프로젝트를 위한 Supabase 설정 방법을 안내합니다.

## 1단계: Supabase 계정 생성 및 프로젝트 생성

### 1.1 계정 생성
1. https://supabase.com 방문
2. "Start your project" 클릭
3. GitHub, Google, 또는 이메일로 계정 생성

### 1.2 새 프로젝트 생성
1. 대시보드에서 "New Project" 클릭
2. 조직 선택 (개인 계정 사용 시 본인 계정 선택)
3. 프로젝트 정보 입력:
   - **Name**: `grigo-entertainment`
   - **Database Password**: 안전한 비밀번호 설정 (기록해두세요!)
   - **Region**: `Asia Northeast (Seoul)` 선택 (한국 서버)
4. "Create new project" 클릭
5. 프로젝트 생성 완료까지 약 2-3분 대기

## 2단계: API 키 및 URL 확인

### 2.1 프로젝트 설정으로 이동
1. 프로젝트 대시보드에서 좌측 사이드바의 "Settings" 클릭
2. "API" 탭 클릭

### 2.2 필요한 정보 복사
다음 정보들을 복사하여 메모장에 저장하세요:

- **Project URL**: `https://your-project-id.supabase.co`
- **anon public** key: 클라이언트에서 사용하는 익명 키
- **service_role** key: 서버에서 사용하는 관리자 키 (보안 주의!)

## 3단계: 데이터베이스 테이블 생성

### 3.1 SQL 에디터 접근
1. 프로젝트 대시보드에서 좌측 사이드바의 "SQL Editor" 클릭
2. 새 쿼리 창이 열립니다

### 3.2 스키마 실행
1. `supabase-schema.sql` 파일의 모든 내용을 복사
2. SQL 에디터에 붙여넣기
3. 우측 하단의 "Run" 버튼 클릭
4. 성공 메시지 확인: "Database schema created successfully! 🎉"

### 3.3 테이블 확인
1. 좌측 사이드바의 "Table Editor" 클릭
2. 다음 테이블들이 생성되었는지 확인:
   - `admins` (관리자)
   - `clients` (고객사)
   - `portfolios` (포트폴리오)

## 4단계: .env 파일 설정

프로젝트 루트의 `.env` 파일을 다음과 같이 수정하세요:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Supabase Configuration (2단계에서 복사한 정보 사용)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-public-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Session Secret
SESSION_SECRET=grigo-entertainment-secret-key-2024

# Admin Configuration
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=admin123
```

⚠️ **보안 주의사항**: 
- `service_role` 키는 모든 데이터베이스 권한을 가지므로 절대 클라이언트 코드에서 사용하지 마세요
- 프로덕션에서는 더 안전한 `SESSION_SECRET`을 사용하세요

## 5단계: RLS (Row Level Security) 정책 확인

### 5.1 RLS 정책이란?
Row Level Security는 테이블의 각 행에 대한 접근을 제어하는 PostgreSQL의 보안 기능입니다.

### 5.2 현재 설정된 정책
- **admins**: 인증된 사용자만 접근 가능
- **clients**: 모든 사용자 읽기 가능, 인증된 사용자만 수정 가능
- **portfolios**: 모든 사용자 읽기 가능, 인증된 사용자만 수정 가능

### 5.3 정책 확인 방법
1. Supabase 대시보드 → "Authentication" → "Policies"
2. 각 테이블별로 정책이 활성화되어 있는지 확인

## 6단계: 테스트

### 6.1 서버 실행
```bash
npm install
npm start
```

### 6.2 테스트 확인사항
1. 서버가 오류 없이 시작되는지 확인
2. http://localhost:3000 에서 메인 페이지 로딩 확인
3. http://localhost:3000/admin 에서 관리자 로그인 페이지 확인
4. admin/admin123 계정으로 로그인 테스트

## 7단계: 데이터 확인 (선택사항)

### 7.1 Supabase 대시보드에서 데이터 확인
1. "Table Editor" → "admins" 테이블 클릭
2. 기본 관리자 계정이 생성되었는지 확인

### 7.2 API 테스트
브라우저에서 다음 URL들을 테스트해보세요:
- http://localhost:3000/api/clients
- http://localhost:3000/api/portfolios

## 문제 해결

### 연결 오류 발생 시
1. `.env` 파일의 URL과 키가 정확한지 확인
2. Supabase 프로젝트가 활성 상태인지 확인
3. 네트워크 연결 상태 확인

### 테이블이 없다는 오류 시
1. SQL 스크립트가 완전히 실행되었는지 확인
2. "Table Editor"에서 테이블 목록 확인
3. 오류가 있었다면 스크립트를 다시 실행

### 인증 오류 시
1. `service_role` 키가 올바른지 확인
2. RLS 정책이 올바르게 설정되었는지 확인

## 추가 기능 (고급)

### Supabase Storage 사용 (미래 확장)
현재는 로컬 파일 시스템을 사용하지만, 향후 Supabase Storage를 사용하여 클라우드 파일 저장이 가능합니다.

### 실시간 기능
Supabase의 실시간 구독 기능을 사용하여 데이터 변경 시 자동 업데이트가 가능합니다.

### 인증 시스템 업그레이드
현재는 세션 기반 인증을 사용하지만, Supabase Auth를 사용하여 더 강력한 인증 시스템 구축이 가능합니다.

---

설정 완료! 🎉 이제 GRIGO ENTERTAINMENT 관리자 시스템을 사용할 수 있습니다.