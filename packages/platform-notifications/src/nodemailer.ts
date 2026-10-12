import nodemailer from "nodemailer";
import type { InvitationDeliveryProvider } from "./types.js";

/**
 * SMTP configuration reads NEVO_SMTP_* / NEVO_EMAIL_FROM env vars directly — an exact
 * port of nevo-event-os-3's implementation, the only real consumer of this provider today.
 * Kept as-is rather than genericized to an unproven env-var convention; see README.
 */
export function nodemailerEnvironmentIsConfigured(environment: NodeJS.ProcessEnv = process.env) {
  try {
    NodemailerDeliveryProvider.fromEnvironment(environment);
    return true;
  } catch {
    return false;
  }
}

export class NodemailerDeliveryProvider implements InvitationDeliveryProvider {
  constructor(private readonly transporter: ReturnType<typeof nodemailer.createTransport>, private readonly from: string) {}

  static fromEnvironment(environment: NodeJS.ProcessEnv = process.env) {
    const host = environment.NEVO_SMTP_HOST;
    const port = Number(environment.NEVO_SMTP_PORT ?? "587");
    const user = environment.NEVO_SMTP_USER;
    const pass = environment.NEVO_SMTP_PASSWORD;
    const from = environment.NEVO_EMAIL_FROM;
    if (!host || !Number.isInteger(port) || !from) throw new Error("Nodemailer SMTP configuration is incomplete");

    const hasCredentials = Boolean(user && pass);
    if (Boolean(user) !== Boolean(pass)) throw new Error("Nodemailer SMTP credentials must include both user and password");

    // Mailpit is intentionally unauthenticated. Never make that transport available
    // outside an explicit, localhost-only development opt-in.
    const localhost = host === "localhost" || host === "127.0.0.1" || host === "::1";
    const localPreview = environment.NEVO_SMTP_ALLOW_INSECURE_LOCAL === "1" && environment.NODE_ENV !== "production" && localhost;
    if (!hasCredentials && !localPreview) throw new Error("Nodemailer SMTP credentials are required outside local preview");

    return new NodemailerDeliveryProvider(nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      ...(hasCredentials ? { auth: { user, pass } } : {}),
    }), from);
  }

  async send(input: Parameters<InvitationDeliveryProvider["send"]>[0]) {
    const message = await this.transporter.sendMail({ from: this.from, to: input.recipient, subject: input.subject, text: input.body, headers: { "X-NEVO-Idempotency-Key": input.idempotencyKey } });
    return { providerReference: message.messageId, status: "QUEUED" as const };
  }
}
