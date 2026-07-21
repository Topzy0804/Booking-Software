import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_ADDRESS = process.env.EMAIL_FROM || "Booking MVP <onboarding@resend.dev>";

export async function sendBookingConfirmationEmail(params: {
  to: string;
  clientName: string;
  tenantName: string;
  serviceName: string;
  resourceName: string;
  startsAt: Date;
  durationMinutes: number;
  priceCents: number;
}) {
  if (!resend) {
    console.warn(
      "[email] RESEND_API_KEY not set -- skipping confirmation email for",
      params.to
    );
    return;
  }

  const dateLabel = params.startsAt.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const timeLabel = params.startsAt.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  const priceLabel = `$${(params.priceCents / 100).toFixed(2)}`;

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: params.to,
      subject: `You're booked with ${params.tenantName}`,
      html: renderConfirmationHtml({ ...params, dateLabel, timeLabel, priceLabel }),
    });
  } catch (err) {
    console.error("[email] Failed to send booking confirmation:", err);
  }
}


function renderConfirmationHtml(params: {
  clientName: string;
  tenantName: string;
  serviceName: string;
  resourceName: string;
  durationMinutes: number;
  dateLabel: string;
  timeLabel: string;
  priceLabel: string;
}) {
  return `
   <div style="background:#F7F5EF; padding:32px 16px; font-family:Georgia, 'Times New Roman', serif; color:#22261F;">
    <div style="max-width:420px; margin:0 auto; background:#FFFFFF; border-radius:10px; padding:32px 28px; box-shadow:0 10px 30px rgba(34,38,31,0.08);">
      <div style="width:44px; height:44px; border-radius:50%; background:#3E5C46; color:#fff; font-size:20px; line-height:44px; text-align:center; margin:0 auto 16px;">&#10003;</div>
      <h1 style="font-size:19px; text-align:center; margin:0 0 4px;">You're booked</h1>
      <p style="font-family:Arial, Helvetica, sans-serif; font-size:13px; color:#55594E; text-align:center; margin:0 0 20px;">
        Hi ${escapeHtml(params.clientName)}, your appointment with ${escapeHtml(params.tenantName)} is confirmed.
      </p>
      <div style="border-top:1px dashed #DDD6C5; margin:20px 0;"></div>
      ${row("Service", `${escapeHtml(params.serviceName)}, ${params.durationMinutes}min`)}
      ${row("With", escapeHtml(params.resourceName))}
      ${row("Date", params.dateLabel)}
      ${row("Time", params.timeLabel)}
      ${row("Total", params.priceLabel)}
    </div>
    <p style="font-family:Arial, Helvetica, sans-serif; font-size:11px; color:#55594E; text-align:center; margin-top:16px;">
      Need to reschedule or cancel? Reply to this email or contact ${escapeHtml(params.tenantName)} directly.
    </p>
  </div>`;
}

function row(label: string, value: string) {
  return `
  <table role="presentation" width="100%" style="font-family:Arial, Helvetica, sans-serif; font-size:13px; margin-bottom:4px;">
    <tr>
      <td style="color:#55594E; padding:4px 0;">${label}</td>
      <td style="text-align:right; font-weight:600; color:#22261F; padding:4px 0;">${value}</td>
    </tr>
  </table>`;
}

function escapeHtml(str: string) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}