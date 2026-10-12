export type DeliveryChannel = "EMAIL" | "SMS" | "WHATSAPP" | "IN_APP";

export type DeliveryResult = { providerReference: string; status: "QUEUED" | "SENT" };

export interface InvitationDeliveryProvider {
  send(input: {
    channel: DeliveryChannel;
    recipient: string;
    subject: string;
    body: string;
    idempotencyKey: string;
  }): Promise<DeliveryResult>;
}
