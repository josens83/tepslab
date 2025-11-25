import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  // For production, use actual SMTP service
  // For development, use ethereal email or similar
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email
 */
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"TEPS Lab" <${process.env.SMTP_FROM || 'noreply@tepslab.com'}>`,
      ...options,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Send email error:', error);
    return false;
  }
};

/**
 * Email Templates
 */

// Welcome email template
export const getWelcomeEmailTemplate = (name: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Pretendard', sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .card { background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .logo { font-size: 24px; font-weight: bold; color: #FCD535; margin-bottom: 20px; }
        h1 { color: #333; margin: 0 0 20px; }
        p { color: #666; line-height: 1.6; }
        .button { display: inline-block; background: #FCD535; color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="logo">TEPS Lab</div>
          <h1>환영합니다, ${name}님!</h1>
          <p>TEPS Lab에 가입해 주셔서 감사합니다.</p>
          <p>이제 당신만의 맞춤형 TEPS 학습을 시작할 수 있습니다. 진단 테스트를 통해 현재 실력을 확인하고, 최적화된 커리큘럼으로 목표 점수를 달성하세요!</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="button">학습 시작하기</a>
          <div class="footer">
            <p>본 메일은 발신 전용입니다.</p>
            <p>© ${new Date().getFullYear()} TEPS Lab. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Password reset email template
export const getPasswordResetEmailTemplate = (name: string, resetUrl: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Pretendard', sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .card { background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .logo { font-size: 24px; font-weight: bold; color: #FCD535; margin-bottom: 20px; }
        h1 { color: #333; margin: 0 0 20px; }
        p { color: #666; line-height: 1.6; }
        .button { display: inline-block; background: #FCD535; color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0; }
        .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 12px; border-radius: 8px; font-size: 14px; color: #856404; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="logo">TEPS Lab</div>
          <h1>비밀번호 재설정</h1>
          <p>${name}님, 비밀번호 재설정을 요청하셨습니다.</p>
          <p>아래 버튼을 클릭하여 새 비밀번호를 설정하세요.</p>
          <a href="${resetUrl}" class="button">비밀번호 재설정</a>
          <div class="warning">
            ⚠️ 이 링크는 1시간 후 만료됩니다. 본인이 요청하지 않았다면 이 메일을 무시해주세요.
          </div>
          <div class="footer">
            <p>본 메일은 발신 전용입니다.</p>
            <p>© ${new Date().getFullYear()} TEPS Lab. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Payment confirmation email template
export const getPaymentConfirmationEmailTemplate = (
  name: string,
  courseTitle: string,
  amount: number,
  orderId: string
): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Pretendard', sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .card { background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .logo { font-size: 24px; font-weight: bold; color: #FCD535; margin-bottom: 20px; }
        h1 { color: #333; margin: 0 0 20px; }
        p { color: #666; line-height: 1.6; }
        .button { display: inline-block; background: #FCD535; color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0; }
        .receipt { background: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .receipt-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .receipt-row:last-child { border-bottom: none; font-weight: bold; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="logo">TEPS Lab</div>
          <h1>결제 완료</h1>
          <p>${name}님, 결제가 성공적으로 완료되었습니다.</p>

          <div class="receipt">
            <div class="receipt-row">
              <span>강의명</span>
              <span>${courseTitle}</span>
            </div>
            <div class="receipt-row">
              <span>주문번호</span>
              <span>${orderId}</span>
            </div>
            <div class="receipt-row">
              <span>결제일시</span>
              <span>${new Date().toLocaleString('ko-KR')}</span>
            </div>
            <div class="receipt-row">
              <span>결제금액</span>
              <span>${amount.toLocaleString()}원</span>
            </div>
          </div>

          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/my-courses" class="button">학습 시작하기</a>

          <div class="footer">
            <p>본 메일은 발신 전용입니다.</p>
            <p>© ${new Date().getFullYear()} TEPS Lab. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email verification template
export const getEmailVerificationTemplate = (name: string, verifyUrl: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Pretendard', sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .card { background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .logo { font-size: 24px; font-weight: bold; color: #FCD535; margin-bottom: 20px; }
        h1 { color: #333; margin: 0 0 20px; }
        p { color: #666; line-height: 1.6; }
        .button { display: inline-block; background: #FCD535; color: #000; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="logo">TEPS Lab</div>
          <h1>이메일 인증</h1>
          <p>${name}님, 이메일 주소를 인증해주세요.</p>
          <p>아래 버튼을 클릭하여 이메일 인증을 완료하세요.</p>
          <a href="${verifyUrl}" class="button">이메일 인증하기</a>
          <p style="font-size: 12px; color: #999;">링크가 작동하지 않는 경우 아래 URL을 복사하여 브라우저에 붙여넣으세요:<br>${verifyUrl}</p>
          <div class="footer">
            <p>본 메일은 발신 전용입니다.</p>
            <p>© ${new Date().getFullYear()} TEPS Lab. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};
