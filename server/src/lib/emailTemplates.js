const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function layout(title, bodyHtml) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f4f4f0;font-family:Arial,Helvetica,sans-serif;color:#111">
    <table role="presentation" width="100%" style="max-width:520px;margin:0 auto;background:#fff;border:3px solid #000">
      <tr><td style="padding:16px 24px;background:#ffe600;border-bottom:3px solid #000;font-weight:900;font-size:18px">SYNCRONIFY</td></tr>
      <tr><td style="padding:24px">
        <h1 style="margin:0 0 16px;font-size:20px">${escapeHtml(title)}</h1>
        ${bodyHtml}
      </td></tr>
    </table>
  </body>
</html>`;
}

const button = (href, label) =>
  `<p style="margin:24px 0"><a href="${escapeHtml(href)}" style="background:#000;color:#fff;padding:12px 20px;text-decoration:none;font-weight:700">${escapeHtml(label)}</a></p>`;

function verificationCode({ name, otp, expiresInMinutes }) {
  const subject = `${otp} is your Syncronify verification code`;
  const text = `Hi ${name},\n\nYour verification code is ${otp}. It expires in ${expiresInMinutes} minutes.\n\nIf you didn't create a Syncronify account, you can ignore this email.`;
  const html = layout(
    'Verify your email',
    `<p>Hi ${escapeHtml(name)},</p>
     <p>Use this code to finish creating your account:</p>
     <p style="font-size:32px;font-weight:900;letter-spacing:8px;margin:16px 0">${escapeHtml(otp)}</p>
     <p style="color:#555">It expires in ${expiresInMinutes} minutes. If you didn't sign up, ignore this email.</p>`
  );
  return { subject, text, html };
}

function passwordReset({ name, resetUrl, expiresInMinutes }) {
  const subject = 'Reset your Syncronify password';
  const text = `Hi ${name},\n\nReset your password here: ${resetUrl}\nThe link expires in ${expiresInMinutes} minutes.\n\nIf you didn't request this, you can ignore this email.`;
  const html = layout(
    'Reset your password',
    `<p>Hi ${escapeHtml(name)},</p>
     <p>We received a request to reset your password.</p>
     ${button(resetUrl, 'Choose a new password')}
     <p style="color:#555">The link expires in ${expiresInMinutes} minutes. If you didn't request this, ignore this email.</p>`
  );
  return { subject, text, html };
}

/** Generic notification email (reminders, event changes, approvals). */
function notification({ name, title, body, url }) {
  const text = `Hi ${name},\n\n${body}${url ? `\n\n${url}` : ''}`;
  const html = layout(
    title,
    `<p>Hi ${escapeHtml(name)},</p>
     <p>${escapeHtml(body)}</p>
     ${url ? button(url, 'Open Syncronify') : ''}`
  );
  return { subject: title, text, html };
}

module.exports = { verificationCode, passwordReset, notification };
