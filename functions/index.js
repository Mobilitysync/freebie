/**
 * Firebase Functions config:
 * 1. Set the Gmail sender address:
 *    firebase functions:secrets:set GMAIL_EMAIL
 * 2. Set a Gmail app password for that sender:
 *    firebase functions:secrets:set GMAIL_APP_PASSWORD
 * 3. Deploy:
 *    firebase deploy --only functions
 */

const nodemailer = require("nodemailer");
const logger = require("firebase-functions/logger");
const { defineSecret } = require("firebase-functions/params");
const {
  onDocumentCreated,
  onDocumentUpdated,
} = require("firebase-functions/v2/firestore");

const gmailEmail = defineSecret("GMAIL_EMAIL");
const gmailAppPassword = defineSecret("GMAIL_APP_PASSWORD");
const appBaseUrl = "https://freebie-5762a.web.app";

function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailEmail.value(),
      pass: gmailAppPassword.value(),
    },
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatInr(amount) {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) {
    return "Not specified";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numericAmount);
}

function formatDeadline(deadline) {
  if (!deadline) {
    return "Not specified";
  }

  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) {
    return String(deadline);
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function buttonHtml(url, label) {
  return `
    <a href="${escapeHtml(url)}"
       style="display:inline-block;background:#1a1a1a;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:8px;font-weight:700;margin-top:18px;">
      ${escapeHtml(label)}
    </a>`;
}

exports.onDealCreated = onDocumentCreated(
  {
    document: "deals/{dealId}",
    secrets: [gmailEmail, gmailAppPassword],
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      logger.warn("onDealCreated fired without snapshot data.");
      return;
    }

    const deal = snapshot.data();
    if (!deal.clientEmail) {
      logger.warn("Deal created without clientEmail.", { dealId: event.params.dealId });
      return;
    }

    const dealUrl = `${appBaseUrl}/deal.html?id=${event.params.dealId}`;
    const freelancerName = deal.freelancerName || "Your freelancer";
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"Freebie" <${gmailEmail.value()}>`,
      to: deal.clientEmail,
      subject: `[Freebie] ${freelancerName} has shared a deal with you`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1a1a1a;max-width:640px;margin:0 auto;">
          <h2 style="margin-bottom:8px;">${escapeHtml(freelancerName)} has shared a deal with you</h2>
          <p>Please review the details below and confirm when you are ready.</p>
          <table style="width:100%;border-collapse:collapse;margin-top:18px;">
            <tr>
              <td style="padding:10px;border-bottom:1px solid #eeeeee;font-weight:700;">Freelancer</td>
              <td style="padding:10px;border-bottom:1px solid #eeeeee;">${escapeHtml(freelancerName)}</td>
            </tr>
            <tr>
              <td style="padding:10px;border-bottom:1px solid #eeeeee;font-weight:700;">Work</td>
              <td style="padding:10px;border-bottom:1px solid #eeeeee;">${escapeHtml(deal.workDescription || "Not specified")}</td>
            </tr>
            <tr>
              <td style="padding:10px;border-bottom:1px solid #eeeeee;font-weight:700;">Payment</td>
              <td style="padding:10px;border-bottom:1px solid #eeeeee;">${escapeHtml(formatInr(deal.paymentAmount))}</td>
            </tr>
            <tr>
              <td style="padding:10px;border-bottom:1px solid #eeeeee;font-weight:700;">Deadline</td>
              <td style="padding:10px;border-bottom:1px solid #eeeeee;">${escapeHtml(formatDeadline(deal.deadline))}</td>
            </tr>
          </table>
          ${buttonHtml(dealUrl, "View & Agree to Deal")}
        </div>
      `,
    });

    logger.info("Deal created email sent.", {
      dealId: event.params.dealId,
      clientEmail: deal.clientEmail,
    });
  }
);

exports.onDealAgreed = onDocumentUpdated(
  {
    document: "deals/{dealId}",
    secrets: [gmailEmail, gmailAppPassword],
  },
  async (event) => {
    if (!event.data) {
      logger.warn("onDealAgreed fired without change data.");
      return;
    }

    const before = event.data.before.data();
    const after = event.data.after.data();
    const wasAgreed = Boolean(before.clientAgreed && before.freelancerAgreed);
    const isAgreed = Boolean(after.clientAgreed && after.freelancerAgreed);

    if (wasAgreed || !isAgreed) {
      return;
    }

    const recipients = [after.freelancerEmail, after.clientEmail].filter(Boolean);
    if (recipients.length === 0) {
      logger.warn("Deal agreed without email recipients.", { dealId: event.params.dealId });
      return;
    }

    const dealUrl = `${appBaseUrl}/deal.html?id=${event.params.dealId}`;
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"Freebie" <${gmailEmail.value()}>`,
      to: recipients.join(","),
      subject: "[Freebie] Your deal is now active",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1a1a1a;max-width:640px;margin:0 auto;">
          <h2 style="margin-bottom:8px;">Your deal is now active</h2>
          <p>Both ${escapeHtml(after.freelancerName || "the freelancer")} and ${escapeHtml(after.clientName || "the client")} have agreed to the deal.</p>
          <p><strong>Work:</strong> ${escapeHtml(after.workDescription || "Not specified")}</p>
          <p><strong>Payment:</strong> ${escapeHtml(formatInr(after.paymentAmount))}</p>
          <p><strong>Deadline:</strong> ${escapeHtml(formatDeadline(after.deadline))}</p>
          ${buttonHtml(dealUrl, "View Deal")}
        </div>
      `,
    });

    logger.info("Deal agreed confirmation email sent.", {
      dealId: event.params.dealId,
      recipients,
    });
  }
);
