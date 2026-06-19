// ============================================================
// Notification Engine — Global interceptor for AlertifyPayload
// ============================================================

// Co-locate CSS with the consuming module (keeps them out of landing page critical path)
import 'izitoast/dist/css/iziToast.min.css'
import 'sweetalert2/dist/sweetalert2.min.css'
import '@/assets/css/notify.css'

import iziToast from 'izitoast'
import Swal from 'sweetalert2'
import type { ApiResponse, AlertifyPayload } from '@/types/api-response'

// ---- iziToast defaults ----
iziToast.settings({
  position: 'topRight',
  transitionIn: 'fadeInLeft',
  transitionOut: 'fadeOutRight',
  timeout: 4000,
  progressBar: true,
  progressBarColor: '',
  close: true,
  animateInside: true,
  layout: 1,
})

// ---- Severity → iziToast method mapping ----
const TOAST_CONFIG: Record<
  AlertifyPayload['severity'],
  { bg: string; text: string; icon: string; timeout: number }
> = {
  success: { bg: '#F0FDFA', text: '#0F766E', icon: 'ico-success', timeout: 4000 },
  error:   { bg: '#FEF2F2', text: '#B91C1C', icon: 'ico-error',   timeout: 0 },     // persistent
  warning: { bg: '#FFFBEB', text: '#D97706', icon: 'ico-warning', timeout: 6000 },
  info:    { bg: '#F0F9FF', text: '#0369A1', icon: 'ico-info',    timeout: 4000 },
}

// ---- SweetAlert2 theme ----
const swalTheme = {
  customClass: {
    popup: 'cqis-swal-popup',
    title: 'cqis-swal-title',
    htmlContainer: 'cqis-swal-html',
    confirmButton: 'cqis-swal-confirm',
    cancelButton: 'cqis-swal-cancel',
  },
  buttonsStyling: false,
}

// ============================================================
// Public API
// ============================================================

export const notify = {
  /**
   * Show a toast notification (auto-dismiss).
   */
  toast(severity: AlertifyPayload['severity'], title: string, message: string) {
    const config = TOAST_CONFIG[severity]
    iziToast.show({
      title,
      message,
      color: '',
      theme: 'light',
      iconColor: config.text,
      titleColor: '#0f172a',
      messageColor: config.text,
      backgroundColor: config.bg,
      progressBarColor: config.text,
      timeout: config.timeout,
      icon: config.icon,
      position: 'topRight',
    })
  },

  /**
   * Show a modal alert (requires user to dismiss).
   */
  alert(severity: AlertifyPayload['severity'], title: string, message: string) {
    const iconMap: Record<AlertifyPayload['severity'], 'success' | 'error' | 'warning' | 'info'> = {
      success: 'success',
      error: 'error',
      warning: 'warning',
      info: 'info',
    }

    Swal.fire({
      icon: iconMap[severity],
      title,
      text: message,
      confirmButtonText: 'OK',
      ...swalTheme,
    })
  },

  /**
   * Show a confirmation dialog. Returns `true` if confirmed, `false` otherwise.
   */
  async confirm(
    title: string,
    message: string,
    options?: {
      confirmText?: string
      cancelText?: string
      icon?: 'warning' | 'question' | 'info'
    }
  ): Promise<boolean> {
    const result = await Swal.fire({
      icon: options?.icon || 'warning',
      title,
      text: message,
      showCancelButton: true,
      confirmButtonText: options?.confirmText || 'Yes, proceed',
      cancelButtonText: options?.cancelText || 'Cancel',
      reverseButtons: true,
      ...swalTheme,
    })

    return result.isConfirmed
  },

  /**
   * Global interceptor — auto-dispatch based on alertify.type.
   * Call this after every service call in stores.
   */
  handleResponse(response: ApiResponse): void {
    const { alertify } = response

    switch (alertify.type) {
      case 'toast':
        this.toast(alertify.severity, alertify.title, alertify.message)
        break
      case 'alert':
        this.alert(alertify.severity, alertify.title, alertify.message)
        break
      case 'silent':
        if (!response.ok) {
          console.warn(`[Silent Error] ${alertify.title}: ${alertify.message}`)
        }
        break
    }
  },
}
