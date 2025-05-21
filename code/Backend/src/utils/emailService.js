import nodemailer from 'nodemailer';

export const sendEmail = async ({ email, subject, html }) => {
    try {
        // Check if required environment variables are set
        if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
            console.error('Email configuration is missing. Check your environment variables.');
            
            // In development, you can use a dummy email service that logs to console
            if (process.env.NODE_ENV === 'development') {
                console.log('--------- DEVELOPMENT EMAIL ---------');
                console.log(`To: ${email}`);
                console.log(`Subject: ${subject}`);
                console.log(`Body: ${html}`);
                console.log('------------------------------------');
                return true;
            }
            
            throw new Error('Email service is not configured correctly');
        }

        // Create a transporter with Gmail configuration
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        // Send email
        const info = await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME || 'Eklavya LMS'}" <${process.env.EMAIL_USERNAME}>`,
            to: email,
            subject,
            html
        });

        console.log(`Email sent: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error; // Re-throw to be handled by the caller
    }
};