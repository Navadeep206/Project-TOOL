import nodemailer from 'nodemailer';

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT || 587,
            secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

    async sendInvitationEmail(toEmail, inviteLink, role, projectName) {
        // If credentials are not configured, just log to console to prevent crashes
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn(`[EMAIL_SERVICE] Credentials missing. Would have sent invite to ${toEmail}`);
            return false;
        }

        const subject = `You are invited to join ${projectName}`;

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        background-color: #020617;
                        color: #e2e8f0;
                        margin: 0;
                        padding: 20px;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #0f172a;
                        border: 1px solid #1e293b;
                        border-radius: 12px;
                        overflow: hidden;
                    }
                    .header {
                        background-color: #1e293b;
                        padding: 30px 20px;
                        text-align: center;
                        border-bottom: 1px solid #334155;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 24px;
                        color: #f8fafc;
                        letter-spacing: -0.02em;
                    }
                    .content {
                        padding: 30px;
                    }
                    .content p {
                        font-size: 16px;
                        line-height: 1.6;
                        color: #94a3b8;
                    }
                    .role-badge {
                        display: inline-block;
                        padding: 6px 12px;
                        background-color: rgba(99, 102, 241, 0.1);
                        color: #818cf8;
                        border: 1px solid rgba(99, 102, 241, 0.2);
                        border-radius: 9999px;
                        font-size: 14px;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                        margin-top: 10px;
                    }
                    .button-container {
                        text-align: center;
                        margin-top: 30px;
                        margin-bottom: 20px;
                    }
                    .btn {
                        display: inline-block;
                        padding: 14px 28px;
                        background-color: #4f46e5;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: 600;
                        font-size: 16px;
                        transition: background-color 0.2s;
                    }
                    .btn:hover {
                        background-color: #4338ca;
                    }
                    .footer {
                        padding: 20px;
                        text-align: center;
                        font-size: 12px;
                        color: #64748b;
                        border-top: 1px solid #1e293b;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Project Management System</h1>
                    </div>
                    <div class="content">
                        <p>Hello,</p>
                        <p>You have been invited to collaborate on the project <strong>${projectName}</strong>.</p>
                        <p>Your designated role will be:</p>
                        <div><span class="role-badge">${role}</span></div>
                        <p>Click the button below to accept the invitation and activate your account.</p>
                        
                        <div class="button-container">
                            <a href="${inviteLink}" class="btn">Accept Invitation</a>
                        </div>
                        
                        <p style="font-size: 14px; margin-top: 30px;">If the button doesn't work, you can copy and paste this link into your browser:<br>
                        <a href="${inviteLink}" style="color: #6366f1; word-break: break-all;">${inviteLink}</a></p>
                    </div>
                    <div class="footer">
                        <p>This is an automated system message. Please do not reply.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        try {
            await this.transporter.sendMail({
                from: `"Project System" <${process.env.EMAIL_USER}>`,
                to: toEmail,
                subject,
                html: htmlContent,
            });
            console.log(`[EMAIL_SERVICE] Invitation sent to ${toEmail}`);
            return true;
        } catch (error) {
            console.error('[EMAIL_SERVICE] Failed to send email:', error);
            return false;
        }
    }
}

export const emailService = new EmailService();
