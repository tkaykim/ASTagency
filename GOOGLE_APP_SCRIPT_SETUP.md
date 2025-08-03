# Google App Script 설정 가이드

## 1. Google App Script 프로젝트 생성

1. [Google App Script](https://script.google.com/)에 접속
2. "새 프로젝트" 클릭
3. 프로젝트 이름을 "AST Company Form Handler"로 변경

## 2. 코드 복사

1. `google-app-script-code.gs` 파일의 내용을 복사
2. Google App Script 편집기에 붙여넣기
3. 저장 (Ctrl+S 또는 Cmd+S)

## 3. 웹앱 배포

1. 상단 메뉴에서 "배포" → "새 배포" 클릭
2. "유형 선택"에서 "웹앱" 선택
3. 설정:
   - **설명**: "AST Company Partner Channel Form Handler"
   - **다음 사용자로 실행**: "나" (본인)
   - **액세스 권한**: "모든 사용자" (익명 사용자 포함)
4. "배포" 버튼 클릭
5. 권한 요청이 나타나면 "권한 검토" → "고급" → "안전하지 않은 페이지로 이동" → "허용"
6. 배포 완료 후 웹앱 URL 복사

## 4. 웹사이트 코드 업데이트

1. `public/index.html` 파일에서 다음 줄을 찾으세요:
   ```javascript
   const scriptUrl = 'YOUR_GOOGLE_APP_SCRIPT_WEB_APP_URL_HERE';
   ```

2. 복사한 웹앱 URL로 교체:
   ```javascript
   const scriptUrl = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
   ```

## 5. 테스트

1. 웹사이트에서 파트너 채널 이미지 클릭
2. 모달에서 폼 작성 후 "제출하기" 클릭
3. `contact@astcompany.co.kr`로 이메일이 도착하는지 확인

## 6. 문제 해결

### 이메일이 도착하지 않는 경우:
1. Google App Script 로그 확인: "보기" → "실행 로그"
2. Gmail 스팸 폴더 확인
3. `contact@astcompany.co.kr` 이메일 주소가 올바른지 확인

### CORS 오류가 발생하는 경우:
- `mode: 'no-cors'`가 이미 설정되어 있으므로 문제없어야 함

### 권한 오류가 발생하는 경우:
1. Google App Script에서 "서비스" → "Gmail API" 활성화
2. 배포 설정에서 "액세스 권한"을 "모든 사용자"로 설정했는지 확인

## 7. 보안 고려사항

- 웹앱 URL이 공개되므로 추가 보안이 필요한 경우:
  - Google App Script에서 요청 검증 로직 추가
  - Rate limiting 구현
  - CAPTCHA 추가 고려

## 8. 모니터링

- Google App Script 대시보드에서 실행 로그 확인 가능
- Gmail에서 받은 이메일로 문의 접수 현황 모니터링 