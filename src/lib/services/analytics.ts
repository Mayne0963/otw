import { env } from "../env";

type EventName =
  | "page_view"
  | "sign_up"
  | "login"
  | "add_to_cart"
  | "remove_from_cart"
  | "begin_checkout"
  | "purchase"
  | "search"
  | "view_item"
  | "view_item_list"
  | "select_item"
  | "share"
  | "custom_event";

type EventProperties = Record<string, string | number | boolean | null>;

class AnalyticsService {
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = env.ENABLE_ANALYTICS;
  }

  /**
   * Track a user event
   */
  public trackEvent(eventName: EventName, properties?: EventProperties): void {
    if (!this.isEnabled) return;

    try {
      // Send to Google Analytics if available
      if (typeof window !== "undefined" && "gtag" in window) {
        const gtag = (window as any).gtag;
        gtag("event", eventName, properties);
      }

      // Log to console in development
      if (process.env.NODE_ENV === "development") {
        console.log(`[Analytics] ${eventName}`, properties);
      }
    } catch (error) {
      console.error("[Analytics Error]", error);
    }
  }

  /**
   * Track page view
   */
  public trackPageView(url: string): void {
    this.trackEvent("page_view", { page_path: url });
  }

  /**
   * Identify user
   */
  public identifyUser(userId: string, traits?: Record<string, any>): void {
    if (!this.isEnabled) return;

    try {
      // Send to Google Analytics if available
      if (typeof window !== "undefined" && "gtag" in window) {
        const gtag = (window as any).gtag;
        gtag("set", "user_properties", {
          user_id: userId,
          ...traits,
        });
      }

      // Log to console in development
      if (process.env.NODE_ENV === "development") {
        console.log(`[Analytics] Identify User: ${userId}`, traits);
      }
    } catch (error) {
      console.error("[Analytics Error]", error);
    }
  }
}

export const analytics = new AnalyticsService();
