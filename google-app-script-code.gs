function doPost(e) {
  try {
    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);
    
    // Extract form data
    const inquiryChannel = data.inquiryChannel || '';
    const inquiryType = data.inquiryType || '';
    const title = data.title || '';
    const contact = data.contact || '';
    const content = data.content || '';
    const timestamp = data.timestamp || new Date().toISOString();
    
    // Create email subject and body
    const emailSubject = `[파트너 채널 문의] ${title}`;
    const emailBody = `새로운 파트너 채널 문의가 접수되었습니다.

문의 채널: ${inquiryChannel}
문의 구분: ${inquiryType}
제목: ${title}
연락처: ${contact}
내용: ${content}

접수 시간: ${new Date(timestamp).toLocaleString('ko-KR')}

---
이 메일은 AST Company 웹사이트를 통해 자동으로 발송되었습니다.`;

    // Send email
    GmailApp.sendEmail(
      'contact@astcompany.co.kr',
      emailSubject,
      emailBody,
      {
        name: 'AST Company 웹사이트',
        replyTo: contact.includes('@') ? contact : 'noreply@astcompany.co.kr'
      }
    );
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Log error for debugging
    console.error('Error in doPost:', error);
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({ 
        'result': 'error', 
        'error': error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // Handle GET requests (optional, for testing)
  return ContentService
    .createTextOutput('AST Company Partner Channel Form Handler is running.')
    .setMimeType(ContentService.MimeType.TEXT);
} 