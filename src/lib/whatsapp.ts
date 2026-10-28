// WhatsApp abstraction layer (future-ready).
//
// No paid API is integrated yet. This module provides a stable interface
// so that, when a provider is chosen (e.g. Meta Cloud API, Twilio, 360dialog),
// only the implementation here needs to change.

export interface WhatsAppMessage {
  phone: string; // E.164, e.g. +244923000000
  message: string;
}

export interface WhatsAppResult {
  ok: boolean;
  provider: string;
  detail?: string;
}

/**
 * Send a WhatsApp message. Currently a stub that logs locally.
 * Wire this up to a provider-specific edge function later.
 */
export async function sendMessage(
  phone: string,
  message: string,
): Promise<WhatsAppResult> {
  if (!phone || !message) {
    return { ok: false, provider: "stub", detail: "missing phone or message" };
  }
  // eslint-disable-next-line no-console
  console.log("[whatsapp:stub] →", phone, message.slice(0, 120));
  return { ok: true, provider: "stub", detail: "not yet integrated" };
}

export const whatsapp = { sendMessage };
