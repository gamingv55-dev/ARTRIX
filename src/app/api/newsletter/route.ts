import { NextResponse } from "next/server";

/**
 * Newsletter signup.
 *
 * ═══════════════════════════════════════════════════════════════════════
 * MOCK BOUNDARY
 *
 * This handler validates and responds. It does not store the address and does
 * not forward it anywhere — there is no email provider connected.
 *
 * To make it real, replace the marked block below with a call to your provider
 * (Klaviyo, Mailchimp, Resend Audiences, Buttondown). Keep the API key in an
 * environment variable — see .env.example — and keep the call server-side, in
 * this file. Nothing on the client should ever hold that key.
 * ═══════════════════════════════════════════════════════════════════════
 */

// Deliberately permissive: address validation beyond this rejects real
// addresses more often than it catches fake ones. The provider is the real
// arbiter of deliverability.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  let email: unknown;

  try {
    const body = await request.json();
    email = (body as { email?: unknown }).email;
  } catch {
    return NextResponse.json({ message: "Malformed request." }, { status: 400 });
  }

  if (typeof email !== "string" || email.length > 254 || !EMAIL_PATTERN.test(email.trim())) {
    return NextResponse.json({ message: "That does not look like an email address." }, { status: 422 });
  }

  // ── Replace this block with the provider call ────────────────────────
  //
  //   await fetch("https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs", {
  //     method: "POST",
  //     headers: {
  //       Authorization: `Klaviyo-API-Key ${process.env.KLAVIYO_API_KEY}`,
  //       "Content-Type": "application/json",
  //       revision: "2024-10-15",
  //     },
  //     body: JSON.stringify({ /* … */ }),
  //   });
  //
  // Until then the address is discarded, and the response says as much rather
  // than implying a subscription that does not exist.
  // ─────────────────────────────────────────────────────────────────────

  return NextResponse.json(
    { message: "Address accepted — the list is not connected yet." },
    { status: 200 },
  );
}

export async function GET() {
  return NextResponse.json({ message: "Method not allowed." }, { status: 405 });
}
