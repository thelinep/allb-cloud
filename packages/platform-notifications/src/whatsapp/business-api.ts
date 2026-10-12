import type { DeliveryChannel, DeliveryResult, InvitationDeliveryProvider } from "../types.js";

export type WhatsAppBusinessConfig = {
  phoneNumberId: string;
  apiToken: string;
  apiVersion?: string;
};

type GraphMessageResponse = { messages?: Array<{ id: string }> };

// WhatsApp Cloud API (Meta Graph API). Free-form "text" messages only succeed inside the
// 24-hour customer service window; outside it, use sendTemplateMessage with an approved template.
// NEVO_WHATSAPP_* env var naming is an exact port from nevo-event-os-3, the only real
// consumer of this provider today — see README.
export class WhatsAppBusinessDeliveryProvider implements InvitationDeliveryProvider {
  private readonly apiVersion: string;

  constructor(private readonly config: WhatsAppBusinessConfig) {
    this.apiVersion = config.apiVersion ?? "v20.0";
  }

  static fromEnvironment(environment: NodeJS.ProcessEnv = process.env): WhatsAppBusinessDeliveryProvider {
    const phoneNumberId = environment.NEVO_WHATSAPP_PHONE_NUMBER_ID;
    const apiToken = environment.NEVO_WHATSAPP_API_TOKEN;
    if (!phoneNumberId || !apiToken) throw new Error("WhatsApp Business API configuration is incomplete");
    return new WhatsAppBusinessDeliveryProvider({ phoneNumberId, apiToken, apiVersion: environment.NEVO_WHATSAPP_API_VERSION });
  }

  private endpoint() {
    return `https://graph.facebook.com/${this.apiVersion}/${this.config.phoneNumberId}/messages`;
  }

  private async post(body: unknown): Promise<GraphMessageResponse> {
    const response = await fetch(this.endpoint(), {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.config.apiToken}` },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`WhatsApp API request failed: ${response.status}`);
    return (await response.json()) as GraphMessageResponse;
  }

  async send(input: { channel: DeliveryChannel; recipient: string; subject: string; body: string; idempotencyKey: string }): Promise<DeliveryResult> {
    const data = await this.post({
      messaging_product: "whatsapp",
      to: input.recipient,
      type: "text",
      text: { body: input.body },
    });
    const messageId = data.messages?.[0]?.id;
    if (!messageId) throw new Error("WhatsApp API response did not include a message id");
    return { providerReference: messageId, status: "SENT" };
  }

  // For outbound messages outside the 24-hour session window, WhatsApp requires a pre-approved template.
  async sendTemplateMessage(input: { recipient: string; templateName: string; languageCode?: string; params: string[] }): Promise<DeliveryResult> {
    const data = await this.post({
      messaging_product: "whatsapp",
      to: input.recipient,
      type: "template",
      template: {
        name: input.templateName,
        language: { code: input.languageCode ?? "en" },
        components: input.params.length > 0 ? [{ type: "body", parameters: input.params.map((text) => ({ type: "text", text })) }] : undefined,
      },
    });
    const messageId = data.messages?.[0]?.id;
    if (!messageId) throw new Error("WhatsApp API response did not include a message id");
    return { providerReference: messageId, status: "SENT" };
  }
}
