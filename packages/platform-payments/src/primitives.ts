import type { PaymentProvider } from "./index.js";

// Infrastructure contracts only; no transitions or settlement decisions.
export type PaymentState = "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";
export type PaymentIntentInput = Parameters<PaymentProvider["createIntent"]>[0];
export type PaymentIntentResult = Awaited<ReturnType<PaymentProvider["createIntent"]>>;
export type RefundInput = Parameters<PaymentProvider["refund"]>[0];
export type RefundResult = Awaited<ReturnType<PaymentProvider["refund"]>>;
export type WebhookVerificationInput = Parameters<PaymentProvider["verifyWebhook"]>[0];

/** Existing Prisma unique-conflict shape; classification only, no claim/retry/store. */
export interface PaymentIdempotencyConflict { code: "P2002" }
export function isPaymentIdempotencyConflict(error: unknown): error is PaymentIdempotencyConflict {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "P2002";
}

// Providers retain their original Error instances, messages and thrown fetch errors.
// This type does not invent error codes or wrap failures during extraction.
export type PaymentProviderError = Error;
