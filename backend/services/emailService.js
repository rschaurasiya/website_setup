const nodemailer = require('nodemailer');

// Reuse existing transporter logic (or create new if preferred)
const createTransporter = () => {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }
    return null;
};

const sendEmail = async (to, subject, html) => {
    const transporter = createTransporter();
    if (!transporter) {
        console.warn(`[EMAIL SERVICE] WARNING: Emails are not being sent because EMAIL_USER or EMAIL_PASS is missing in .env`);
        console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
        return;
    }

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html
        });
        console.log(`📧 Email sent to ${to}: ${subject}`);
    } catch (error) {
        console.error('Email Error:', error);
    }
};

const sendApplicationReceived = async (user) => {
    const subject = 'Creator Application Received';
    const html = `
        <h2>Application Received</h2>
        <p>Hi ${user.name},</p>
        <p>Thank you for applying to become a creator on Law Blog.</p>
        <p>Our team will review your application within 2 working days. Until then, dashboard access is restricted.</p>
        <p>You will receive an email once your application is approved or rejected.</p>
    `;
    await sendEmail(user.email, subject, html);
};

const sendApplicationApproved = async (user) => {
    const subject = '🎉 Application Approved!';
    const html = `
        <h2>Welcome aboard!</h2>
        <p>Hi ${user.name},</p>
        <p>Your application to become a Law Blog Creator has been <strong>APPROVED</strong>.</p>
        <p>You can now access your dashboard and start writing blogs. Note that all blogs are subject to admin review before publishing.</p>
        <br/>
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin">Go to Dashboard</a>
    `;
    await sendEmail(user.email, subject, html);
};

const sendApplicationRejected = async (user, reason) => {
    const subject = 'Application Status Update';
    const html = `
        <h2>Application Update</h2>
        <p>Hi ${user.name},</p>
        <p>Thank you for your interest. Unfortunately, your application to become a creator was not approved at this time.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>You may re-apply in the future if your qualifications change.</p>
    `;
    await sendEmail(user.email, subject, html);
};

const sendBlogStatusUpdate = async (user, blog, status, reason = '') => {
    const subject = `Blog Status Update: ${blog.title}`;
    let html = `
        <h2>Blog Update</h2>
        <p>Hi ${user.name},</p>
        <p>Your blog post "<strong>${blog.title}</strong>" has been updated to: <strong>${status.toUpperCase()}</strong>.</p>
    `;

    if (status === 'published') {
        html += `<p>It is now live on the website!</p>`;
    } else if (status === 'rejected') {
        html += `<p><strong>Reason:</strong> ${reason}</p>`;
        html += `<p>You can edit the blog and resubmit it.</p>`;
    }

    await sendEmail(user.email, subject, html);
};

module.exports = {
    sendApplicationReceived,
    sendApplicationApproved,
    sendApplicationRejected,
    sendBlogStatusUpdate
};
