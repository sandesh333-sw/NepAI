import nodemailer from "nodemailer";

// Configure Mailtrap SMTP transporter (perfect for development/testing)
const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST || "smtp.mailtrap.io",
    port: parseInt(process.env.MAILTRAP_PORT || "2525"),
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
    },
});

export const sendWelcomeEmail = async (email, name) => {
    try {
        const mailOptions = {
            from: `"NepAI Team" <noreply@nepai.com>`,
            to: email,
            subject: 'Welcome to NepAI ! 🚀',
            html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0;">Welcome to NepAI!</h1>
                </div>
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #333; margin-top: 0;">Hello, ${name || 'User'}! 👋</h2>
                    <p style="color: #666; line-height: 1.6;">
                        We're thrilled to have you join our community! You're all set to start chatting with your AI assistant.
                    </p>
                    <p style="color: #666; line-height: 1.6;">
                        Get started by asking any question or exploring the features we have to offer.
                    </p>
                    <div style="margin: 30px 0; text-align: center;">
                        <a href="http://localhost:5173" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                            Start Chatting →
                        </a>
                    </div>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="color: #999; font-size: 14px; margin: 0;">
                        Best regards,<br/>
                        <strong>The NepAI Team</strong>
                    </p>
                </div>
            </div>`
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Welcome email sent to ${email} (via Mailtrap)`);
        
    } catch (error) {
        console.error("❌ Error sending email:", error.message);
        // Don't throw - email failures shouldn't block registration
    }
}