// Frontend email helper.
//
// Email sending happens server-side inside the `dispatch-event` Edge Function.
// This module exposes typed helpers that internally call `dispatchEvent`,
// so the frontend never needs the email provider API key.

import { dispatchEvent } from "@/lib/events";

export const email = {
  async welcome(user_id: string, email: string, display_name: string) {
    return dispatchEvent("user_registered", {
      user_id,
      email,
      display_name,
    });
  },

  async paymentApproved(args: {
    user_id: string;
    product_name: string;
    amount: number;
  }) {
    return dispatchEvent("payment_approved", args);
  },

  async paymentPending(args: { user_id: string; product_name: string }) {
    return dispatchEvent("payment_pending", args);
  },

  async paymentRejected(args: {
    user_id: string;
    product_name: string;
    reason?: string;
  }) {
    return dispatchEvent("payment_rejected", args);
  },

  async newsletterWelcome(args: { email: string; name?: string | null }) {
    return dispatchEvent("newsletter_subscribed", args);
  },
};
