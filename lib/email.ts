import "server-only";

import { Resend } from "resend";
import { formatCents } from "@/lib/format";

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true") {
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

const DEFAULT_FROM =
  process.env.EMAIL_FROM || "Bleetary Travels <adventures@bleetary.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://bleetary.com";

interface BaseEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: BaseEmailOptions): Promise<{ success: boolean; id?: string; mocked?: boolean }> {
  const resend = getResend();

  if (!resend) {
    console.log(
      `\n[📧 Transactional Email Mock Delivery]`,
      `\nTo: ${to}`,
      `\nFrom: ${DEFAULT_FROM}`,
      `\nSubject: ${subject}`,
      `\nPreview: ${text || html.slice(0, 140)}...\n`,
    );
    return { success: true, mocked: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to,
      subject,
      html,
      text: text || "",
    });

    if (error) {
      console.error("[Resend Email Error]:", error);
      return { success: false };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error("[Email Exception]:", err);
    return { success: false };
  }
}

// ─── Branded HTML Email Templates ──────────────────────────────────────────

export interface BookingConfirmationEmailParams {
  travelerEmail: string;
  travelerName: string;
  tripTitle: string;
  departureDates: string;
  depositAmountCents: number;
  totalAmountCents: number;
  bookingId: string;
}

export async function sendBookingConfirmationEmail(
  params: BookingConfirmationEmailParams,
) {
  const {
    travelerEmail,
    travelerName,
    tripTitle,
    departureDates,
    depositAmountCents,
    totalAmountCents,
    bookingId,
  } = params;

  const remainingBalanceCents = Math.max(0, totalAmountCents - depositAmountCents);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f5f7; margin: 0; padding: 24px; color: #1e293b; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
          .header { background: linear-gradient(135deg, #13b5b1 0%, #0d9b97 100%); padding: 36px 32px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; }
          .content { padding: 32px; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin: 20px 0; }
          .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
          .row-bold { font-weight: bold; border-top: 1px solid #e2e8f0; margin-top: 8px; padding-top: 8px; }
          .btn { display: inline-block; background-color: #f05c40; color: #ffffff; font-weight: bold; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 12px; margin-top: 24px; }
          .footer { padding: 24px 32px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your spot is officially locked in! 🎉</h1>
            <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">Booking Reference: #${bookingId.slice(0, 8)}</p>
          </div>
          <div class="content">
            <p style="font-size: 16px; margin-top: 0;">Hi <strong>${travelerName}</strong>,</p>
            <p style="font-size: 14px; line-height: 1.6; color: #475569;">
              We're thrilled to confirm your reservation for <strong>${tripTitle}</strong>. Your initial deposit has been processed successfully.
            </p>
            
            <div class="card">
              <div class="row">
                <span style="color: #64748b;">Adventure</span>
                <strong>${tripTitle}</strong>
              </div>
              <div class="row">
                <span style="color: #64748b;">Dates</span>
                <strong>${departureDates}</strong>
              </div>
              <div class="row">
                <span style="color: #64748b;">Deposit Paid</span>
                <strong style="color: #10b981;">${formatCents(depositAmountCents)}</strong>
              </div>
              <div class="row">
                <span style="color: #64748b;">Remaining Balance</span>
                <strong>${formatCents(remainingBalanceCents)}</strong>
              </div>
              <div class="row row-bold">
                <span>Total Trip Cost</span>
                <span>${formatCents(totalAmountCents)}</span>
              </div>
            </div>

            <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
              You can review full itinerary details, view payment due dates, and update your dietary preferences anytime from your traveler portal.
            </p>

            <div style="text-align: center;">
              <a href="${APP_URL}/account" class="btn" style="color: #ffffff;">View My Booking & Itinerary</a>
            </div>
          </div>
          <div class="footer">
            Bleetary Travels · Group adventures hosted by community leaders.<br>
            Need help? Reply directly to this email or visit our Help Center.
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: travelerEmail,
    subject: `Booking Confirmed: ${tripTitle} 🌴`,
    html,
    text: `Hi ${travelerName}, your booking for ${tripTitle} (${departureDates}) is confirmed! Deposit paid: ${formatCents(depositAmountCents)}. View itinerary at ${APP_URL}/account`,
  });
}

export interface HostApplicationDecisionEmailParams {
  applicantEmail: string;
  applicantName: string;
  decision: "approved" | "rejected" | "waitlisted" | "under_review";
  reviewNotes?: string | null;
}

export async function sendHostApplicationDecisionEmail(
  params: HostApplicationDecisionEmailParams,
) {
  const { applicantEmail, applicantName, decision, reviewNotes } = params;

  const isApproved = decision === "approved";
  const subject = isApproved
    ? "Welcome to the Bleetary Host Network! 🎉"
    : `Update on your Bleetary Host Application`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f5f7; margin: 0; padding: 24px; color: #1e293b; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
          .header { background: ${isApproved ? "linear-gradient(135deg, #10b981 0%, #0d9b97 100%)" : "linear-gradient(135deg, #334155 0%, #1e293b 100%)"}; padding: 36px 32px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 900; }
          .content { padding: 32px; }
          .notes { background: #f8fafc; border-left: 4px solid #13b5b1; padding: 16px; margin: 20px 0; border-radius: 8px; font-size: 13px; color: #334155; }
          .btn { display: inline-block; background-color: #13b5b1; color: #ffffff; font-weight: bold; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 12px; margin-top: 24px; }
          .footer { padding: 24px 32px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${isApproved ? "You're Approved to Host! 🚀" : "Application Status Update"}</h1>
          </div>
          <div class="content">
            <p style="font-size: 16px; margin-top: 0;">Hi <strong>${applicantName}</strong>,</p>
            
            ${
              isApproved
                ? `
              <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                Congratulations! Our team has reviewed and approved your host application. Your host profile has been created and you now have full access to the Bleetary Host Workspace.
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                You can start proposing group itineraries, sharing interest surveys with your community, and planning your next creator retreat.
              </p>
              ${
                reviewNotes
                  ? `<div class="notes"><strong>Team Note:</strong> ${reviewNotes}</div>`
                  : ""
              }
              <div style="text-align: center;">
                <a href="${APP_URL}/host/dashboard" class="btn" style="color: #ffffff;">Launch Host Dashboard</a>
              </div>
            `
                : `
              <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                Thank you for applying to host with Bleetary Travels. At this stage, your application status has been updated to <strong>${decision.replace("_", " ")}</strong>.
              </p>
              ${
                reviewNotes
                  ? `<div class="notes"><strong>Feedback from our team:</strong> ${reviewNotes}</div>`
                  : ""
              }
              <p style="font-size: 13px; color: #64748b;">
                If you have questions or would like to provide additional details about your community, please feel free to reach out directly.
              </p>
            `
            }
          </div>
          <div class="footer">
            Bleetary Travels Creator & Community Team
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: applicantEmail,
    subject,
    html,
    text: `Hi ${applicantName}, your Bleetary host application status is: ${decision}.`,
  });
}

export interface NewBookingHostAlertEmailParams {
  hostEmail: string;
  hostName: string;
  tripTitle: string;
  departureDates: string;
  travelerName: string;
  guestCount: number;
}

export async function sendNewBookingHostAlertEmail(
  params: NewBookingHostAlertEmailParams,
) {
  const {
    hostEmail,
    hostName,
    tripTitle,
    departureDates,
    travelerName,
    guestCount,
  } = params;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f5f7; margin: 0; padding: 24px; color: #1e293b; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
          .header { background: #1e293b; padding: 28px 32px; color: #ffffff; }
          .content { padding: 32px; }
          .btn { display: inline-block; background-color: #13b5b1; color: #ffffff; font-weight: bold; font-size: 14px; text-decoration: none; padding: 12px 24px; border-radius: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin:0; font-size: 20px;">New Booking Confirmed 🎒</h2>
          </div>
          <div class="content">
            <p>Hi <strong>${hostName}</strong>,</p>
            <p style="font-size: 14px; line-height: 1.6; color: #475569;">
              Great news! <strong>${travelerName}</strong> just reserved ${guestCount} spot${guestCount === 1 ? "" : "s"} on your upcoming departure of <strong>${tripTitle}</strong> (${departureDates}).
            </p>
            <a href="${APP_URL}/host/dashboard" class="btn" style="color: #ffffff;">View Passenger Manifest</a>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: hostEmail,
    subject: `New Traveler Booked: ${tripTitle} 🚀`,
    html,
    text: `Hi ${hostName}, ${travelerName} just booked ${guestCount} spot(s) on ${tripTitle}!`,
  });
}
