import nodemailer from "nodemailer";

//Configure email transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendWelcomeEmail = async (email, name) => {
    try {
        const mailOptions = {
            from: `"NepAI Team" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Welcome to NepAI ! 🚀',
            html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
             <h1>Welcome, ${name || 'User'}!</h1>
             <p>We're excited to have you on board.</p>
             <p>Start chatting with your AI assistant today.</p>
             <br/>
          <p>Best,<br/>The NepAI Team</p>
            </div>`
        };

        await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent to ${email}`);
        
    } catch (error) {
        console.error("Error sending email: ", error);
    }
}