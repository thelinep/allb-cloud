import { createHmac, timingSafeEqual } from "node:crypto";
import type { PaymentProvider } from "../index.js";

export type DirectUpiConfig = {
  bankApiBaseUrl: string;
  bankApiKey: string;
  merchantVpa: string;
  webhookSecret: string;
  terminalId?: string;
};

// Direct settlement against a bank/NPCI merchant gateway (no intermediary like Razorpay).
// The bank's actual REST contract must be confirmed against its merchant API docs before
// production use; this client assumes a generic JSON REST shape until that spec is provided.
export class DirectUpiPaymentProvider implements PaymentProvider {
  constructor(private readonly config: DirectUpiConfig) {
    let endpoint: URL;
    try { endpoint = new URL(config.bankApiBaseUrl); } catch { throw new Error("Direct UPI bank API URL is invalid"); }
    if (endpoint.protocol !== "https:" || endpoint.username || endpoint.password) throw new Error("Direct UPI bank API URL must be credential-free HTTPS");
  }

  static fromEnvironment(environment: NodeJS.ProcessEnv = process.env): DirectUpiPaymentProvider {
    const bankApiBaseUrl = environment.NEVO_UPI_BANK_API_URL;
    const bankApiKey = environment.NEVO_UPI_BANK_API_KEY;
    const merchantVpa = environment.NEVO_UPI_MERCHANT_ID;
    const webhookSecret = environment.NEVO_WEBHOOK_SECRET;
    if (!bankApiBaseUrl || !bankApiKey || !merchantVpa || !webhookSecret) throw new Error("Direct UPI bank configuration is incomplete");
    return new DirectUpiPaymentProvider({ bankApiBaseUrl, bankApiKey, merchantVpa, webhookSecret, terminalId: environment.NEVO_UPI_BANK_TERMINAL_ID });
  }

  private async call<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(new URL(path, this.config.bankApiBaseUrl).toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.config.bankApiKey}` },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`Bank UPI API request failed: ${response.status}`);
    return (await response.json()) as T;
  }

  async createIntent(input: { amount: number; currency: string; idempotencyKey: string }) {
    const data = await this.call<{ reference: string }>("/payments/intents", {
      amount: input.amount,
      currency: input.currency,
      payeeVpa: this.config.merchantVpa,
      terminalId: this.config.terminalId,
      idempotencyKey: input.idempotencyKey,
    });
    return { providerReference: data.reference, status: "PENDING" as const };
  }

  async refund(input: { providerReference: string; amount: number }) {
    const data = await this.call<{ reference: string }>(`/payments/${encodeURIComponent(input.providerReference)}/refunds`, { amount: input.amount });
    return { providerReference: data.reference, status: "PENDING" as const };
  }

  async verifyWebhook(input: { signature?: string; payload: string; secret?: string }) {
    const secret = input.secret ?? this.config.webhookSecret;
    if (!input.signature || !secret) return false;
    const supplied = input.signature.replace(/^sha256=/, "");
    let expectedBuffer: Buffer;
    let suppliedBuffer: Buffer;
    try {
      expectedBuffer = Buffer.from(createHmac("sha256", secret).update(input.payload).digest("hex"), "hex");
      suppliedBuffer = Buffer.from(supplied, "hex");
    } catch {
      return false;
    }
    return suppliedBuffer.length === expectedBuffer.length && timingSafeEqual(suppliedBuffer, expectedBuffer);
  }
}
