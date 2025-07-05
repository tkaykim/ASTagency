-- GRIGO ENTERTAINMENT - Supabase Database Schema
-- Supabase 프로젝트의 SQL 에디터에서 실행하세요.

-- 1. 관리자 테이블 생성
CREATE TABLE IF NOT EXISTS admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 클라이언트 테이블 생성
CREATE TABLE IF NOT EXISTS clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name_korean VARCHAR(100) NOT NULL,
    name_english VARCHAR(100) NOT NULL,
    logo_path TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 포트폴리오 테이블 생성
CREATE TABLE IF NOT EXISTS portfolios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category VARCHAR(50) NOT NULL CHECK (category IN ('유튜브 브랜디드', '유튜브 PPL', '브랜드필름 제작', 'SNS 광고', '전속모델')),
    video_link TEXT NOT NULL,
    client_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. RLS (Row Level Security) 정책 설정
-- 관리자 테이블: 인증된 사용자만 접근 가능
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "관리자만 접근 가능" ON admins FOR ALL USING (auth.role() = 'authenticated');

-- 클라이언트 테이블: 모든 사용자 읽기 가능, 인증된 사용자만 수정 가능
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "모든 사용자 읽기 가능" ON clients FOR SELECT USING (true);
CREATE POLICY "인증된 사용자만 수정 가능" ON clients FOR ALL USING (auth.role() = 'authenticated');

-- 포트폴리오 테이블: 모든 사용자 읽기 가능, 인증된 사용자만 수정 가능
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "모든 사용자 읽기 가능" ON portfolios FOR SELECT USING (true);
CREATE POLICY "인증된 사용자만 수정 가능" ON portfolios FOR ALL USING (auth.role() = 'authenticated');

-- 5. 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_portfolios_created_at ON portfolios(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_portfolios_category ON portfolios(category);
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);

-- 6. 샘플 데이터 (선택사항)
-- 기본 관리자 계정은 Node.js 서버에서 자동으로 생성됩니다.

-- 테이블 확인
SELECT 'admins' as table_name, count(*) as count FROM admins
UNION ALL
SELECT 'clients' as table_name, count(*) as count FROM clients
UNION ALL
SELECT 'portfolios' as table_name, count(*) as count FROM portfolios;

-- 완료 메시지
SELECT 'Database schema created successfully! 🎉' as message;