import type { DeliveryChannel, InvitationDeliveryProvider } from "./types.js";

/**
 * The always-available fallback delivery provider: it never fails and never actually
 * delivers anything. Used both as an explicit "local preview" mode and as the fallback
 * for any channel that has no real provider configured.
 */
export class LocalDeliveryProvider implements InvitationDeliveryProvider {
  async send(input: Parameters<InvitationDeliveryProvider["send"]>[0]) {
    return { providerReference: `local-delivery-${input.idempotencyKey}`, status: "SENT" as const };
  }
}

/**
 * Routes each channel to its configured provider, falling back to a local stub for
 * unconfigured channels. This is how a consumer wires up "real email + real WhatsApp,
 * but SMS and in-app still fall back to a local stub" without every call site needing
 * to know which channels are actually configured.
 */
export class CompositeDeliveryProvider implements InvitationDeliveryProvider {
  constructor(
    private readonly byChannel: Partial<Record<DeliveryChannel, InvitationDeliveryProvider>>,
    private readonly fallback: InvitationDeliveryProvider = new LocalDeliveryProvider(),
  ) {}

  async send(input: Parameters<InvitationDeliveryProvider["send"]>[0]) {
    const provider = this.byChannel[input.channel] ?? this.fallback;
    return provider.send(input);
  }
}
