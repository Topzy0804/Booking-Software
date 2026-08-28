import { Resend } from "resend";
import { formatPrice } from '@/lib/currency';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_ADDRESS = process.env.EMAIL_FROM || "Moda by Z <bookings@mail.modabyz.me>";


type BookingEmailParams = {
  to: string;
  clientName: string;
  tenantName: string;
  serviceName: string;
  resourceName: string;
  startsAt: Date;
  durationMinutes: number;
  priceCents: number;
  manageUrl?: string;
};

function deriveLabels(params: BookingEmailParams) {
  return {
    dateLabel: params.startsAt.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    }),
    timeLabel: params.startsAt.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    }),
    priceLabel: `${formatPrice(params.priceCents)} total`,
  };
}

export async function sendBookingConfirmationEmail(params: BookingEmailParams) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set -- skipping confirmation email for", params.to);
    return;
  }
  const labels = deriveLabels(params);

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: params.to,
      subject: `You're booked with ${params.tenantName}`,
      html: renderCard({
        ...params,
        ...labels,
        accentColor: "#3E5C46",
        icon: "&#10003;",
        heading: "You're booked",
        subtext: `Hi ${escapeHtml(params.clientName)}, your appointment with ${escapeHtml(params.tenantName)} is confirmed.`,
      }),
    });
  }
  catch (error) {
    console.error("[email] Error sending confirmation email for", params.to, error);
  }
}


export async function sendBookingReminderEmail(params: BookingEmailParams): Promise<boolean> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set -- skipping reminder email for", params.to);
    return false;
  }

  const labels = deriveLabels(params);

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: params.to,
      subject: `Reminder: Your appointment with ${params.tenantName} is coming up`,
      html: renderCard({
        ...params,
        ...labels,
        accentColor: "#3E5C46",
        icon: "&#128276;",
        heading: "Reminder: Your appointment is coming up",
        subtext: `Hi ${escapeHtml(params.clientName)}, this is a reminder that your appointment with ${escapeHtml(params.tenantName)} is coming up.`,
      }),
    });

    if (error || !data?.id) {
      console.error("[email] Error sending reminder email for", params.to, error);
      return false;
    }

    return true;
  }
  catch (error) {
    console.error("[email] Error sending reminder email for", params.to, error);
    return false;
  }
}

export async function sendBookingCancellationEmail(params: BookingEmailParams & { cancelledBy?: "staff" | "client" }) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set -- skipping cancellation email for", params.to);
    return;
  }

  const labels = deriveLabels(params);

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: params.to,
      subject: `Your appointment with ${params.tenantName} has been cancelled`,
      html: renderCard({
        ...params,
        ...labels,
        accentColor: "#C0392B",
        icon: "&#10005;",
        heading: "Your appointment has been cancelled",
        subtext: `Hi ${escapeHtml(params.clientName)}, your appointment with ${escapeHtml(params.tenantName)} has been cancelled.`,
      }),
    });
  }
  catch (error) {
    console.error("[email] Error sending cancellation email for", params.to, error);
  }
}


function renderCard(params: {
  tenantName: string;
  serviceName: string;
  resourceName: string;
  durationMinutes: number;
  accentColor: string;
  icon: string;
  heading: string;
  subtext: string;
  dateLabel: string;
  timeLabel: string;
  priceLabel: string;
  manageUrl?: string;
}) {

  return `
  <div style="background:#F7F5EF; padding:32px 16px; font-family:Georgia, 'Times New Roman', serif; color:#22261F;">
    <div style="max-width:420px; margin:0 auto; background:#FFFFFF; border-radius:10px; padding:32px 28px; box-shadow:0 10px 30px rgba(34,38,31,0.08);">
      <div style="width:44px; height:44px; border-radius:50%; background:${params.accentColor}; color:#fff; font-size:19px; line-height:44px; text-align:center; margin:0 auto 16px;">${params.icon}</div>
      <h1 style="font-size:19px; text-align:center; margin:0 0 4px;">${params.heading}</h1>
      <p style="font-family:Arial, Helvetica, sans-serif; font-size:13px; color:#55594E; text-align:center; margin:0 0 20px;">
        ${params.subtext}
      </p>
      <div style="border-top:1px dashed #DDD6C5; margin:20px 0;"></div>
      ${row("Service", `${escapeHtml(params.serviceName)}, ${params.durationMinutes}min`)}
      ${row("With", escapeHtml(params.resourceName))}
      ${row("Date", params.dateLabel)}
      ${row("Time", params.timeLabel)}
      ${row("Total", params.priceLabel)}
      ${
        params.manageUrl
          ? `<div style="text-align:center; margin-top:20px;">
               <a href="${params.manageUrl}" style="display:inline-block; background:#3E5C46; color:#fff; font-family:Arial, Helvetica, sans-serif; font-size:13px; font-weight:600; text-decoration:none; padding:10px 20px; border-radius:6px;">
                 Manage this booking
               </a>
             </div>`
          : ""
      }
    </div>
    <p style="font-family:Arial, Helvetica, sans-serif; font-size:11px; color:#55594E; text-align:center; margin-top:16px;">
      Questions? Reply to this email or contact ${escapeHtml(params.tenantName)} directly.
    </p>
  </div>`
}

function row(label: string, value: string) {
  return `
  <table role="presentation" width="100%" style="font-family:Arial, Helvetica, sans-serif; font-size:13px; margin-bottom:4px;">
    <tr>
      <td style="color:#55594E; padding:4px 0;">${label}</td>
      <td style="text-align:right; font-weight:600; color:#22261F; padding:4px 0;">${value}</td>
    </tr>
  </table>`
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}


export async function sendStaffInviteEmail(params: {
  to: string;
  staffName: string;
  tenantName: string;
  inviteUrl: string;
}) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set -- skipping staff invite for", params.to);
    return;
  }
  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: params.to,
      subject: `You've been invited to join ${params.tenantName}`,
      html: `
      <div style="background:#F7F5EF; padding:32px 16px; font-family:Georgia, 'Times New Roman', serif; color:#22261F;">
        <div style="max-width:420px; margin:0 auto; background:#FFFFFF; border-radius:10px; padding:32px 28px; box-shadow:0 10px 30px rgba(34,38,31,0.08);">
          <h1 style="font-size:19px; text-align:center; margin:0 0 4px;">You're invited</h1>
          <p style="font-family:Arial, Helvetica, sans-serif; font-size:13px; color:#55594E; text-align:center; margin:0 0 20px;">
            Hi ${params.staffName}, ${params.tenantName} has added you as staff. Set up your login to see your schedule and manage your bookings.
          </p>
          <div style="text-align:center; margin-top:10px;">
            <a href="${params.inviteUrl}" style="display:inline-block; background:#3E5C46; color:#fff; font-family:Arial, Helvetica, sans-serif; font-size:13px; font-weight:600; text-decoration:none; padding:10px 20px; border-radius:6px;">
              Set up my account
            </a>
          </div>
        </div>
        <p style="font-family:Arial, Helvetica, sans-serif; font-size:11px; color:#55594E; text-align:center; margin-top:16px;">
          This link expires in 14 days.
        </p>
      </div>`,
    });
  } catch (err) {
    console.error("[email] Failed to send staff invite:", err);
  }
}

export async function sendPasswordResetEmail(params: {
  to: string;
  fullName: string;
  resetUrl: string;
}) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set -- skipping password reset email for", params.to);
    return;
  }
  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: params.to,
      subject: "Reset your password",
      html: `
       <div style="background:#F7F5EF; padding:32px 16px; font-family:Georgia, 'Times New Roman', serif; color:#22261F;">
        <div style="max-width:420px; margin:0 auto; background:#FFFFFF; border-radius:10px; padding:32px 28px; box-shadow:0 10px 30px rgba(34,38,31,0.08);">
          <h1 style="font-size:19px; text-align:center; margin:0 0 4px;">Reset your password</h1>
          <p style="font-family:Arial, Helvetica, sans-serif; font-size:13px; color:#55594E; text-align:center; margin:0 0 20px;">
            Hi ${params.fullName}, we received a request to reset your password. This link expires in 1 hour.
          </p>
          <div style="text-align:center; margin-top:10px;">
            <a href="${params.resetUrl}" style="display:inline-block; background:#3E5C46; color:#fff; font-family:Arial, Helvetica, sans-serif; font-size:13px; font-weight:600; text-decoration:none; padding:10px 20px; border-radius:6px;">
              Reset password
            </a>
          </div>
        </div>
        <p style="font-family:Arial, Helvetica, sans-serif; font-size:11px; color:#55594E; text-align:center; margin-top:16px;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>`
    });
  } catch (err) {
    console.error("[email] Failed to send password reset email:", err);
  }
}