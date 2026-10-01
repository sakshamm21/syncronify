const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('./logger');

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.mail.host,
      port: env.mail.port,
      secure: env.mail.port === 465, // 465 = implicit TLS, 587 = STARTTLS
      auth: { user: env.mail.user, pass: env.mail.password },
    });
  }
  return transporter;
}

/**
 * Sends an email. Never throws: email is a side channel and must not break
 * the request that triggered it. Resolves to `true` only if it was delivered
 * to the SMTP server.
 */
async function sendMail({ to, subject, text, html }) {
  if (!env.mail.enabled) {
    logger.warn({ to, subject }, 'SMTP not configured — email not sent');
    if (!env.isProduction) logger.info(`[mail preview] ${subject}\n${text}`);
    return false;
  }

  try {
    await getTransporter().sendMail({ from: env.mail.from, to, subject, text, html });
    return true;
  } catch (err) {
    logger.error({ err, to, subject }, 'Failed to send email');
    return false;
  }
}

module.exports = { sendMail };
