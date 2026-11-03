"use client"

declare global {
  interface Window {
    gtag?: (
      command: "event",
      eventName: string,
      parameters?: Record<string, string | number | boolean>
    ) => void
  }
}

export function trackEvent(
  eventName: string,
  parameters: Record<string, string | number | boolean> = {}
) {
  if (
    typeof window !== "undefined" &&
    typeof window.gtag === "function"
  ) {
    window.gtag("event", eventName, parameters)
  }
}
