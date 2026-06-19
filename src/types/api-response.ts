// ============================================================
// ApiResponse<T> — Standardized response contract for all services
// ============================================================

/**
 * How the notification should be displayed to the user.
 * - 'toast'  → Auto-dismissing notification (iziToast)
 * - 'alert'  → Modal dialog requiring user action (SweetAlert2)
 * - 'silent' → No UI shown, logged to console only
 */
export type AlertifyType = 'toast' | 'alert' | 'silent'

/**
 * Visual severity of the notification.
 */
export type AlertifySeverity = 'success' | 'error' | 'warning' | 'info'

/**
 * The notification payload embedded in every API response.
 * Services build this payload since they have the most context
 * about what operation was performed.
 */
export interface AlertifyPayload {
  type: AlertifyType
  severity: AlertifySeverity
  title: string
  message: string
}

/**
 * Universal response wrapper returned by all service functions.
 *
 * @template T - The type of the data payload on success
 *
 * @example
 * // Success
 * { ok: true, data: customer, error: null, alertify: { type: 'toast', severity: 'success', title: 'Customer Created', message: '...' } }
 *
 * // Failure
 * { ok: false, data: null, error: 'duplicate key...', alertify: { type: 'toast', severity: 'error', title: 'Save Failed', message: '...' } }
 */
export interface ApiResponse<T = unknown> {
  ok: boolean
  data: T | null
  error: string | null
  alertify: AlertifyPayload
}

// ============================================================
// Factory helpers
// ============================================================

/**
 * Create a successful API response.
 *
 * @param data - The payload data
 * @param alertify - Optional overrides for the notification (defaults to silent success)
 */
export function apiSuccess<T>(
  data: T,
  alertify?: Partial<AlertifyPayload>
): ApiResponse<T> {
  return {
    ok: true,
    data,
    error: null,
    alertify: {
      type: 'silent',
      severity: 'success',
      title: 'Success',
      message: 'Operation completed successfully.',
      ...alertify,
    },
  }
}

/**
 * Create a failed API response.
 *
 * @param error - The raw error (string, Error object, or unknown)
 * @param alertify - Optional overrides for the notification (defaults to error toast)
 */
export function apiError(
  error: unknown,
  alertify?: Partial<AlertifyPayload>
): ApiResponse<never> {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'An unexpected error occurred'

  return {
    ok: false,
    data: null,
    error: message,
    alertify: {
      type: 'toast',
      severity: 'error',
      title: 'Error',
      message,
      ...alertify,
    },
  }
}
