const nodemailer = require("nodemailer");

const sendMail = async (options) => {
    const { SMTP_HOST, SMTP_PORT, SMTP_SERVICE, SMTP_MAIL, SMTP_PASSWORD } = process.env;

    // If SMTP is not configured, log the email instead of crashing the app.
    // This keeps development/demo flows (OTP generation, etc.) working offline.
    if (!SMTP_HOST && !SMTP_SERVICE) {
        console.warn(`[mailer] SMTP not configured — skipping email to ${options.email}.`);
        console.warn(`[mailer] Subject: "${options.subject}"`);
        if (options.message) console.warn(`[mailer] Body: ${options.message}`);
        return { skipped: true };
    }

    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT) || 587,
        secure: SMTP_PORT === '465', // 465 = implicit TLS, 587 = STARTTLS
        auth:{
            user: SMTP_MAIL,
            pass: SMTP_PASSWORD,
        },
    });

    const mailOptions = {
        from: options.from || SMTP_MAIL,
        to: options.email || options.to,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendMail;


// const sgMail = require("@sendgrid/mail");

// sgMail.setApiKey(process.env.SG_KEY || '');

// const sendSGMail = async ({
//   to,
//   sender,
//   subject,
//   html,
//   attachments,
//   text,
// }) => {
//   try {
//     const from = "adityajohri2015@gmail.com";

//     const msg = {
//       to: to, // Change to your recipient
//       from: from, // Change to your verified sender
//       subject: subject,
//       html: html,
//       // text: text, // Uncomment if text is needed
//       attachments,
//     };

//     return sgMail.send(msg);
//   } catch (error) {
//     console.log(error);
//   }
// };

// const sendEmail = async (args) => {
//   if (!(process.env.NODE_ENV === "development")) {
//     return Promise.resolve();
//   } else {
//     return sendSGMail(args);
//   }
// };

// module.exports = sendEmail;



// // import sgMail from "@sendgrid/mail";

// // sgMail.setApiKey(process.env.SG_KEY || '');

// // const sendSGMail = async ({
// //   to,
// //   sender,
// //   subject,
// //   html,
// //   attachments,
// //   text,
// // }) => {
// //   try {
// //     const from = "adityajohri2015@gmail.com";

// //     const msg = {
// //       to: to, // Change to your recipient
// //       from: from, // Change to your verified sender
// //       subject: subject,
// //       html: html,
// //       // text: text,
// //       attachments,
// //     };

    
// //     return sgMail.send(msg);
// //   } catch (error) {
// //     console.log(error);
// //   }
// // };

// // const sendEmail = async (args) => {
// //   if (!(process.env.NODE_ENV === "development")) {
// //     return Promise.resolve();
// //   } else {
// //     return sendSGMail(args);
// //   }
// // };

// // export default sendEmail;