/**
 * Firebase Functions config:
 *   firebase functions:config:set gmail.user="your-gmail@gmail.com" gmail.password="your-gmail-app-password"
 *   firebase deploy --only functions
 */

const functions = require("firebase-functions/v1");
const logger = require("firebase-functions/logger");
const nodemailer = require("nodemailer");

const appBaseUrl = "https://freebie-5762a.web.app";

function getGmailConfig() {
  const gmail = functions.config().gmail || {};

  if (!gmail.user || !gmail.password) {
    throw new Error(
      'Missing Gmail config. Run: firebase functions:config:set gmail.user="your-gmail@gmail.com" gmail.password="your-gmail-app-password"'
    );
  }

  return gmail;
}

function createTransporter(gmail) {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmail.user,
      pass: gmail.password,
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

  if (typeof deadline.toDate === "function") {
    return deadline.toDate().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
  }

  if (typeof deadline === "string") {
    const dateOnlyMatch = deadline.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (dateOnlyMatch) {
      const [, year, month, day] = dateOnlyMatch;
      const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));

      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      });
    }
  }

  const date = new Date(deadline);

  if (Number.isNaN(date.getTime())) {
    return String(deadline);
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

function dealLink(dealId) {
  return `${appBaseUrl}/deal.html?id=${encodeURIComponent(dealId)}`;
}

function buttonHtml(url, label) {
  return `
    <a href="${escapeHtml(url)}"
       style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:13px 22px;border-radius:6px;font-weight:700;margin-top:18px;">
      ${escapeHtml(label)}
    </a>`;
}

function detailRow(label, value) {
  return `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb;font-weight:700;width:130px;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:10px;border-bottom:1px solid #e5e7eb;vertical-align:top;">${escapeHtml(value)}</td>
    </tr>`;
}

function summaryTable(deal) {
  return `
    <table style="width:100%;border-collapse:collapse;margin-top:18px;">
      ${detailRow("Freelancer", deal.freelancerName || "Not specified")}
      ${detailRow("Client", deal.clientName || "Not specified")}
      ${detailRow("Work", deal.workDescription || "Not specified")}
      ${detailRow("Amount", formatInr(deal.paymentAmount))}
      ${detailRow("Deadline", formatDeadline(deal.deadline))}
    </table>`;
}

function pageHtml({ title, intro, deal, url, buttonLabel }) {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:640px;margin:0 auto;">
      <h2 style="margin:0 0 8px;">${escapeHtml(title)}</h2>
      <p style="margin:0 0 10px;">${escapeHtml(intro)}</p>
      ${summaryTable(deal)}
      ${buttonHtml(url, buttonLabel)}
      <p style="font-size:13px;color:#6b7280;margin-top:18px;">
        Or open this link: <a href="${escapeHtml(url)}">${escapeHtml(url)}</a>
      </p>
    </div>`;
}

function uniqueRecipients(emails) {
  return [...new Set(emails.filter(Boolean).map((email) => String(email).trim()).filter(Boolean))];
}

async function sendEmail({ to, subject, html }) {
  const recipients = Array.isArray(to) ? uniqueRecipients(to) : uniqueRecipients([to]);

  if (recipients.length === 0) {
    return false;
  }

  const gmail = getGmailConfig();
  const transporter = createTransporter(gmail);

  await transporter.sendMail({
    from: `"Freebie" <${gmail.user}>`,
    to: recipients.join(","),
    subject,
    html,
  });

  return true;
}

exports.onDealCreated = functions.firestore
  .document("deals/{dealId}")
  .onCreate(async (snapshot, context) => {
    const deal = snapshot.data();
    const dealId = context.params.dealId;

    if (!deal.clientEmail) {
      logger.warn("Deal created without clientEmail.", { dealId });
      return;
    }

    const freelancerName = deal.freelancerName || "Your freelancer";
    const url = dealLink(dealId);

    await sendEmail({
      to: deal.clientEmail,
      subject: `[Freebie] ${freelancerName} sent you a deal`,
      html: pageHtml({
        title: `${freelancerName} sent you a deal`,
        intro: "Review the deal details below and confirm when you are ready.",
        deal,
        url,
        buttonLabel: "View Deal",
      }),
    });

    logger.info("Deal created email sent.", {
      dealId,
      clientEmail: deal.clientEmail,
    });
  });

exports.onDealAgreed = functions.firestore
  .document("deals/{dealId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const dealId = context.params.dealId;

    const wasFullyAgreed = Boolean(before.clientAgreed && before.freelancerAgreed);
    const isFullyAgreed = Boolean(after.clientAgreed && after.freelancerAgreed);

    if (wasFullyAgreed || !isFullyAgreed) {
      return;
    }

    const recipients = uniqueRecipients([after.freelancerEmail, after.clientEmail]);

    if (recipients.length === 0) {
      logger.warn("Deal agreed without email recipients.", { dealId });
      return;
    }

    const url = dealLink(dealId);

    await sendEmail({
      to: recipients,
      subject: "[Freebie] Deal confirmed ✅",
      html: pageHtml({
        title: "Deal confirmed",
        intro: "Both parties have agreed to the deal. Here is the confirmed summary.",
        deal: after,
        url,
        buttonLabel: "View Confirmed Deal",
      }),
    });

    logger.info("Deal agreed confirmation email sent.", {
      dealId,
      recipients,
    });
  });

exports.onDealDisputed = functions.firestore
  .document("deals/{dealId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const dealId = context.params.dealId;

    if (before.status === "disputed" || after.status !== "disputed") {
      return;
    }

    const recipients = uniqueRecipients([after.freelancerEmail, after.clientEmail]);

    if (recipients.length === 0) {
      logger.warn("Deal disputed without email recipients.", { dealId });
      return;
    }

    const url = dealLink(dealId);

    await sendEmail({
      to: recipients,
      subject: "[Freebie] ⚠️ Dispute raised on your deal",
      html: pageHtml({
        title: "Dispute raised on your deal",
        intro: "A dispute has been raised on this deal. Review the details and next steps in Freebie.",
        deal: after,
        url,
        buttonLabel: "View Disputed Deal",
      }),
    });

    logger.info("Deal disputed email sent.", {
      dealId,
      recipients,
    });
  });
