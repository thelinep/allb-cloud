import crypto from "crypto";
import type { PaymentProvider } from "./index.js";

export interface RazorpayOrderParams {
  amount: number; // in paise (multiply rupees by 100)
  currency: string;
  receipt: string; // Reference code or inquiry ID
  notes?: Record<string, string>;
}

export interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment?: {
      entity: {
        id: string;
        // The order this payment was created against -- present on every real
        // Razorpay payment.entity, and the id NEVO's webhook settlement uses
        // to find the PENDING PaymentIntent this event belongs to (see
        // apps/web's webhook route). Not part of RazorpayPaymentProvider's own
        // interface surface, but documented here since it is load-bearing for
        // any consumer of this payload type.
        order_id: string;
        amount: number;
        currency: string;
        status: string;
        receipt: string;
        notes?: Record<string, string>;
      };
    };
    order?: {
      entity: {
        id: string;
        amount: number;
        currency: string;
        receipt: string;
        status: string;
      };
    };
  };
}

export interface RazorpayConfig {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
}

export interface RazorpayRefundParams {
  /** Amount in paise. Omit to refund the full remaining payment amount. */
  amount?: number;
  notes?: Record<string, string>;
  receipt?: string;
}

/**
 * Initialize Razorpay client. Accepts an explicit environment map so callers
 * (RazorpayPaymentProvider.fromEnvironment, tests) can validate a specific
 * environment snapshot instead of always reading the live process.env.
 */
export function getRazorpayConfig(env: NodeJS.ProcessEnv = process.env): RazorpayConfig {
  const keyId = env.RAZORPAY_KEY_ID;
  const keySecret = env.RAZORPAY_KEY_SECRET;
  const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET;

  if (!keyId || !keySecret || !webhookSecret) {
    throw new Error("Razorpay credentials not configured");
  }

  return { keyId, keySecret, webhookSecret };
}

/**
 * Constant-time string comparison. Hardens verifyWebhookSignature and
 * verifyPaymentSignature (Phase C-F-RZP) without changing their accept/reject
 * outcome for any input: two equal-length, byte-identical strings still
 * compare equal, and any length or content mismatch still compares unequal --
 * exactly what plain `===` already returned, just without a timing
 * side-channel on the comparison itself.
 */
function constantTimeStringsEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

/**
 * Converts a NEVO rupee amount (PaymentIntent.amount, refund amount -- always
 * a Decimal(18,2) major-currency figure, e.g. 1500.00 for Rs 1500, the same
 * unit DirectUpiPaymentProvider receives and passes straight to the bank API)
 * into paise, the minor unit Razorpay's REST API requires for both order
 * creation and refunds. This conversion happens exactly once, at the
 * RazorpayPaymentProvider boundary below -- createRazorpayOrder() and
 * createRazorpayRefund() themselves stay unit-agnostic pass-throughs (their
 * own tests exercise them with raw, already-in-paise figures), so nothing
 * outside this file needs to know Razorpay's unit differs from NEVO's own.
 * Rounds rather than truncates to avoid floating-point drift (e.g. 19.99*100
 * evaluating to 1998.9999999999998 in IEEE 754).
 */
function rupeesToRazorpayPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Create a payment order with Razorpay
 */
export async function createRazorpayOrder(
  params: RazorpayOrderParams,
  config: RazorpayConfig = getRazorpayConfig()
): Promise<any> {
  const { keyId, keySecret } = config;

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: params.amount,
      currency: params.currency || "INR",
      receipt: params.receipt,
      notes: params.notes,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Razorpay error: ${error.error?.description || "Unknown error"}`
    );
  }

  return response.json();
}

/**
 * Create a refund against a captured Razorpay payment. Razorpay's refund API
 * is keyed by the *payment* id (not the order id) -- see RazorpayPaymentProvider
 * below for why NEVO's own PaymentIntent.providerReference must already have
 * transitioned from the order id to the payment id by the time refund() is
 * called. Omitting `amount` refunds the full remaining payment amount;
 * NEVO's own callers must always pass an explicit, server-validated amount
 * (see apps/web's commercial route) -- this function performs no amount
 * validation of its own beyond what Razorpay's API itself enforces.
 */
export async function createRazorpayRefund(
  paymentId: string,
  params: RazorpayRefundParams = {},
  config: RazorpayConfig = getRazorpayConfig()
): Promise<any> {
  const { keyId, keySecret } = config;
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const response = await fetch(
    `https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}/refund`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: params.amount,
        notes: params.notes,
        receipt: params.receipt,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Razorpay refund error: ${error.error?.description || "Unknown error"}`
    );
  }

  return response.json();
}

/**
 * Verify Razorpay webhook signature
 */
export function verifyWebhookSignature(
  body: string,
  signature: string,
  config: RazorpayConfig = getRazorpayConfig()
): boolean {
  const { webhookSecret } = config;

  const hash = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");

  return constantTimeStringsEqual(hash, signature);
}

/**
 * Verify payment signature (after user completes payment)
 */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  config: RazorpayConfig = getRazorpayConfig()
): boolean {
  const { keySecret } = config;

  const data = `${orderId}|${paymentId}`;
  const hash = crypto
    .createHmac("sha256", keySecret)
    .update(data)
    .digest("hex");

  return constantTimeStringsEqual(hash, signature);
}

/**
 * Fetch payment details from Razorpay
 */
export async function getPaymentDetails(
  paymentId: string,
  config: RazorpayConfig = getRazorpayConfig()
): Promise<any> {
  const { keyId, keySecret } = config;

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const response = await fetch(
    `https://api.razorpay.com/v1/payments/${paymentId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch payment details");
  }

  return response.json();
}

/**
 * Derives a Razorpay `receipt` value from NEVO's own idempotency key.
 * Razorpay caps `receipt` at 40 characters; NEVO's idempotency keys can be up
 * to 120. Hashing (rather than truncating) avoids collisions between two
 * different idempotency keys that happen to share a long prefix, and stays
 * deterministic so a retried createIntent call with the same idempotency key
 * produces the same receipt.
 */
export function razorpayReceiptFromIdempotencyKey(idempotencyKey: string): string {
  return `nevo_${crypto.createHash("sha256").update(idempotencyKey).digest("hex").slice(0, 32)}`;
}

/**
 * Adapts the free-standing Razorpay helpers above to NEVO's shared
 * PaymentProvider interface (createIntent/refund/verifyWebhook), the same
 * interface DirectUpiPaymentProvider implements. No cryptographic or HTTP
 * logic is duplicated here -- every operation delegates to the functions
 * above, bound to one validated, immutable config captured at construction.
 *
 * Two deliberate departures from a naive one-to-one mapping, both load-bearing:
 *
 * 1. verifyWebhook() always verifies against this instance's OWN
 *    RAZORPAY_WEBHOOK_SECRET, never the generic `secret` the webhook route
 *    passes in (that value is NEVO_WEBHOOK_SECRET, a single shared static
 *    token used for the route's own coarse header check across every
 *    provider -- see apps/web's webhook route). Using the right, distinct,
 *    provider-specific secret here is exactly what makes cross-provider
 *    webhook spoofing fail closed: a signature computed for NEVO-UPI's
 *    secret will not verify against RAZORPAY_WEBHOOK_SECRET, and vice versa.
 *
 * 2. createIntent() returns Razorpay's *order* id as providerReference, but
 *    refund() expects a *payment* id -- Razorpay's refund API operates on
 *    payments, not orders, and the payment id does not exist until checkout
 *    completes. NEVO's webhook settlement branch (not this class) is
 *    responsible for swapping PaymentIntent.providerReference from the order
 *    id to the real payment id at the moment it settles, so a later refund()
 *    call receives the payment id Razorpay actually requires.
 */
export class RazorpayPaymentProvider implements PaymentProvider {
  constructor(private readonly config: RazorpayConfig) {}

  static fromEnvironment(env: NodeJS.ProcessEnv = process.env): RazorpayPaymentProvider {
    return new RazorpayPaymentProvider(getRazorpayConfig(env));
  }

  async createIntent(input: { amount: number; currency: string; idempotencyKey: string }) {
    const order = await createRazorpayOrder(
      { amount: rupeesToRazorpayPaise(input.amount), currency: input.currency, receipt: razorpayReceiptFromIdempotencyKey(input.idempotencyKey) },
      this.config
    );
    if (!order || typeof order.id !== "string") throw new Error("Razorpay order response missing id");
    return { providerReference: order.id as string, status: "PENDING" as const };
  }

  async refund(input: { providerReference: string; amount: number }) {
    const refund = await createRazorpayRefund(input.providerReference, { amount: rupeesToRazorpayPaise(input.amount) }, this.config);
    if (!refund || typeof refund.id !== "string") throw new Error("Razorpay refund response missing id");
    return { providerReference: refund.id as string, status: "PENDING" as const };
  }

  async verifyWebhook(input: { signature?: string; payload: string }) {
    if (!input.signature) return false;
    return verifyWebhookSignature(input.payload, input.signature, this.config);
  }
}

