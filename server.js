const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grigo-entertainment', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB 연결 성공');
}).catch(err => {
  console.warn('MongoDB 연결 실패:', err.message);
  console.warn('서버는 계속 실행되지만 데이터 저장 기능이 제한됩니다.');
});

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// 세션 설정
app.use(session({
  secret: process.env.SESSION_SECRET || 'grigo-entertainment-secret',
  resave: false,
  saveUninitialized: false,
}));

// uploads 디렉토리 생성
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}
if (!fs.existsSync('uploads/logos')) {
  fs.mkdirSync('uploads/logos');
}

// Multer 설정 (파일 업로드)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/logos/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다.'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB 제한
  }
});

// 스키마 정의
const clientSchema = new mongoose.Schema({
  nameKorean: { type: String, required: true },
  nameEnglish: { type: String, required: true },
  logoPath: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const portfolioSchema = new mongoose.Schema({
  category: { 
    type: String, 
    required: true,
    enum: ['유튜브 브랜디드', '유튜브 PPL', '브랜드필름 제작', 'SNS 광고', '전속모델']
  },
  videoLink: { type: String, required: true },
  clientName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Client = mongoose.model('Client', clientSchema);
const Portfolio = mongoose.model('Portfolio', portfolioSchema);
const Admin = mongoose.model('Admin', adminSchema);

// 관리자 계정 초기화 (최초 실행시)
async function initAdmin() {
  try {
    const adminExists = await Admin.findOne({ username: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = new Admin({
        username: 'admin',
        password: hashedPassword
      });
      await admin.save();
      console.log('기본 관리자 계정이 생성되었습니다. (admin/admin123)');
    }
  } catch (error) {
    console.error('관리자 계정 초기화 오류:', error);
  }
}

initAdmin();

// 인증 미들웨어
const requireAuth = (req, res, next) => {
  if (req.session.isAdmin) {
    next();
  } else {
    res.redirect('/admin/login');
  }
};

// 라우트 설정

// 메인 클라이언트 페이지
app.get('/', async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    const portfolios = await Portfolio.find().sort({ createdAt: -1 });
    
    // 기존 index.html 파일을 읽어서 동적 데이터로 수정
    let html = fs.readFileSync('index.html', 'utf8');
    
    // 클라이언트 로고 동적 생성
    let clientLogosHtml = '';
    clients.forEach(client => {
      clientLogosHtml += `<img src="/uploads/logos/${path.basename(client.logoPath)}" alt="${client.nameKorean}" class="client-logo">`;
    });
    
    // 포트폴리오 동적 생성
    let portfoliosHtml = '';
    portfolios.forEach(portfolio => {
      const videoId = extractYouTubeId(portfolio.videoLink);
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      
      portfoliosHtml += `
        <div class="portfolio-card">
          <img src="${thumbnailUrl}" alt="${portfolio.clientName}" class="video-thumbnail">
          <div class="portfolio-info">
            <h4 class="text-lg font-semibold mb-2">${portfolio.clientName}</h4>
            <p class="text-sm text-gray-300 mb-3">${portfolio.category}</p>
            <a href="${portfolio.videoLink}" target="_blank" class="text-purple-400 hover:text-purple-300 text-sm">영상 보기 →</a>
          </div>
        </div>
      `;
    });
    
    // HTML에 동적 데이터 삽입
    html = html.replace('<!-- DYNAMIC_CLIENTS -->', clientLogosHtml);
    html = html.replace('<!-- DYNAMIC_PORTFOLIO -->', portfoliosHtml);
    
    res.send(html);
  } catch (error) {
    console.error('페이지 로딩 오류:', error);
    res.status(500).send('서버 오류가 발생했습니다.');
  }
});

// 관리자 로그인 페이지
app.get('/admin/login', (req, res) => {
  if (req.session.isAdmin) {
    return res.redirect('/admin');
  }
  
  res.send(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>GRIGO 관리자 로그인</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-900 text-white min-h-screen flex items-center justify-center">
        <div class="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
            <h1 class="text-2xl font-bold text-center mb-6 text-purple-400">GRIGO 관리자</h1>
            <form action="/admin/login" method="POST">
                <div class="mb-4">
                    <label class="block text-sm font-medium mb-2">사용자명</label>
                    <input type="text" name="username" required 
                           class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-purple-400">
                </div>
                <div class="mb-6">
                    <label class="block text-sm font-medium mb-2">비밀번호</label>
                    <input type="password" name="password" required 
                           class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-purple-400">
                </div>
                <button type="submit" 
                        class="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition duration-200">
                    로그인
                </button>
            </form>
        </div>
    </body>
    </html>
  `);
});

// 관리자 로그인 처리
app.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    
    if (admin && await bcrypt.compare(password, admin.password)) {
      req.session.isAdmin = true;
      res.redirect('/admin');
    } else {
      res.send(`
        <script>
          alert('로그인 정보가 올바르지 않습니다.');
          window.location.href = '/admin/login';
        </script>
      `);
    }
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).send('서버 오류가 발생했습니다.');
  }
});

// 관리자 대시보드
app.get('/admin', requireAuth, async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    const portfolios = await Portfolio.find().sort({ createdAt: -1 });
    
    res.send(`
      <!DOCTYPE html>
      <html lang="ko">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>GRIGO 관리자 대시보드</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
      </head>
      <body class="bg-gray-900 text-white min-h-screen">
          <div class="container mx-auto px-4 py-8">
              <div class="flex justify-between items-center mb-8">
                  <h1 class="text-3xl font-bold text-purple-400">GRIGO 관리자 대시보드</h1>
                  <a href="/admin/logout" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">로그아웃</a>
              </div>
              
              <div class="grid md:grid-cols-2 gap-8">
                  <!-- 고객사 관리 -->
                  <div class="bg-gray-800 p-6 rounded-lg">
                      <h2 class="text-xl font-bold mb-4 text-green-400">
                          <i class="fas fa-building mr-2"></i>고객사 관리
                      </h2>
                      <form action="/admin/clients" method="POST" enctype="multipart/form-data" class="mb-6">
                          <div class="mb-4">
                              <label class="block text-sm font-medium mb-2">고객사명 (한글)</label>
                              <input type="text" name="nameKorean" required 
                                     class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-green-400">
                          </div>
                          <div class="mb-4">
                              <label class="block text-sm font-medium mb-2">고객사명 (영문)</label>
                              <input type="text" name="nameEnglish" required 
                                     class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-green-400">
                          </div>
                          <div class="mb-4">
                              <label class="block text-sm font-medium mb-2">로고 파일 (PNG)</label>
                              <input type="file" name="logo" accept=".png,.jpg,.jpeg" required 
                                     class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-green-400">
                          </div>
                          <button type="submit" 
                                  class="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition duration-200">
                              고객사 추가
                          </button>
                      </form>
                      
                      <div class="max-h-64 overflow-y-auto">
                          <h3 class="font-semibold mb-2">등록된 고객사 (${clients.length}개)</h3>
                          ${clients.map(client => `
                              <div class="flex items-center justify-between bg-gray-700 p-3 rounded mb-2">
                                  <div class="flex items-center">
                                      <img src="/uploads/logos/${path.basename(client.logoPath)}" alt="${client.nameKorean}" class="w-8 h-8 object-contain mr-3">
                                      <span>${client.nameKorean} (${client.nameEnglish})</span>
                                  </div>
                                  <button onclick="deleteClient('${client._id}')" class="text-red-400 hover:text-red-300">
                                      <i class="fas fa-trash"></i>
                                  </button>
                              </div>
                          `).join('')}
                      </div>
                  </div>
                  
                  <!-- 포트폴리오 관리 -->
                  <div class="bg-gray-800 p-6 rounded-lg">
                      <h2 class="text-xl font-bold mb-4 text-blue-400">
                          <i class="fas fa-video mr-2"></i>포트폴리오 관리
                      </h2>
                      <form action="/admin/portfolios" method="POST" class="mb-6">
                          <div class="mb-4">
                              <label class="block text-sm font-medium mb-2">협력 카테고리</label>
                              <select name="category" required 
                                      class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-400">
                                  <option value="">카테고리 선택</option>
                                  <option value="유튜브 브랜디드">유튜브 브랜디드</option>
                                  <option value="유튜브 PPL">유튜브 PPL</option>
                                  <option value="브랜드필름 제작">브랜드필름 제작</option>
                                  <option value="SNS 광고">SNS 광고</option>
                                  <option value="전속모델">전속모델</option>
                              </select>
                          </div>
                          <div class="mb-4">
                              <label class="block text-sm font-medium mb-2">협력사례영상 링크</label>
                              <input type="url" name="videoLink" required placeholder="https://youtube.com/watch?v=..."
                                     class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-400">
                          </div>
                          <div class="mb-4">
                              <label class="block text-sm font-medium mb-2">클라이언트명</label>
                              <input type="text" name="clientName" required 
                                     class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-400">
                          </div>
                          <button type="submit" 
                                  class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200">
                              포트폴리오 추가
                          </button>
                      </form>
                      
                      <div class="max-h-64 overflow-y-auto">
                          <h3 class="font-semibold mb-2">등록된 포트폴리오 (${portfolios.length}개)</h3>
                          ${portfolios.map(portfolio => `
                              <div class="flex items-center justify-between bg-gray-700 p-3 rounded mb-2">
                                  <div>
                                      <div class="font-medium">${portfolio.clientName}</div>
                                      <div class="text-sm text-gray-400">${portfolio.category}</div>
                                  </div>
                                  <button onclick="deletePortfolio('${portfolio._id}')" class="text-red-400 hover:text-red-300">
                                      <i class="fas fa-trash"></i>
                                  </button>
                              </div>
                          `).join('')}
                      </div>
                  </div>
              </div>
          </div>
          
          <script>
              function deleteClient(id) {
                  if (confirm('정말 삭제하시겠습니까?')) {
                      fetch(\`/admin/clients/\${id}\`, { method: 'DELETE' })
                          .then(() => window.location.reload());
                  }
              }
              
              function deletePortfolio(id) {
                  if (confirm('정말 삭제하시겠습니까?')) {
                      fetch(\`/admin/portfolios/\${id}\`, { method: 'DELETE' })
                          .then(() => window.location.reload());
                  }
              }
          </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('대시보드 로딩 오류:', error);
    res.status(500).send('서버 오류가 발생했습니다.');
  }
});

// 관리자 로그아웃
app.get('/admin/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// 고객사 추가
app.post('/admin/clients', requireAuth, upload.single('logo'), async (req, res) => {
  try {
    const { nameKorean, nameEnglish } = req.body;
    const logoPath = req.file.path;
    
    const client = new Client({
      nameKorean,
      nameEnglish,
      logoPath
    });
    
    await client.save();
    res.redirect('/admin');
  } catch (error) {
    console.error('고객사 추가 오류:', error);
    res.status(500).send('고객사 추가에 실패했습니다.');
  }
});

// 고객사 삭제
app.delete('/admin/clients/:id', requireAuth, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (client) {
      // 로고 파일 삭제
      if (fs.existsSync(client.logoPath)) {
        fs.unlinkSync(client.logoPath);
      }
      await Client.findByIdAndDelete(req.params.id);
    }
    res.status(200).send('삭제 완료');
  } catch (error) {
    console.error('고객사 삭제 오류:', error);
    res.status(500).send('삭제에 실패했습니다.');
  }
});

// 포트폴리오 추가
app.post('/admin/portfolios', requireAuth, async (req, res) => {
  try {
    const { category, videoLink, clientName } = req.body;
    
    const portfolio = new Portfolio({
      category,
      videoLink,
      clientName
    });
    
    await portfolio.save();
    res.redirect('/admin');
  } catch (error) {
    console.error('포트폴리오 추가 오류:', error);
    res.status(500).send('포트폴리오 추가에 실패했습니다.');
  }
});

// 포트폴리오 삭제
app.delete('/admin/portfolios/:id', requireAuth, async (req, res) => {
  try {
    await Portfolio.findByIdAndDelete(req.params.id);
    res.status(200).send('삭제 완료');
  } catch (error) {
    console.error('포트폴리오 삭제 오류:', error);
    res.status(500).send('삭제에 실패했습니다.');
  }
});

// API 엔드포인트
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: '데이터를 불러올 수 없습니다.' });
  }
});

app.get('/api/portfolios', async (req, res) => {
  try {
    const portfolios = await Portfolio.find().sort({ createdAt: -1 });
    res.json(portfolios);
  } catch (error) {
    res.status(500).json({ error: '데이터를 불러올 수 없습니다.' });
  }
});

// 유틸리티 함수
function extractYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행중입니다.`);
  console.log(`클라이언트 페이지: http://localhost:${PORT}`);
  console.log(`관리자 페이지: http://localhost:${PORT}/admin`);
  console.log('기본 관리자 계정: admin / admin123');
});