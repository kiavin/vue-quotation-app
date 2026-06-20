import { toValue, computed, type MaybeRefOrGetter } from 'vue'
import type { BrandingSnapshot } from '@/types/organization'

/**
 * Shared document formatting utilities for PDF templates.
 */
export function useDocumentFormat(brandingParam: MaybeRefOrGetter<BrandingSnapshot> | BrandingSnapshot) {
  
  const currency = computed(() => {
    const branding = typeof brandingParam === 'function' ? brandingParam() : toValue(brandingParam)
    return branding.currency || 'USD'
  })

  /**
   * Format a number as currency using the branding's currency.
   */
  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.value,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  /**
   * Format a date string into a professional long format.
   * e.g. "20 June 2026"
   */
  function formatDate(dateString?: string): string {
    if (!dateString) return ''
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date)
  }

  /**
   * Format a date into a short format.
   * e.g. "20 Jun 2026"
   */
  function formatDateShort(dateString?: string): string {
    if (!dateString) return ''
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date)
  }

  return {
    currency,
    formatCurrency,
    formatDate,
    formatDateShort,
  }
}

/**
 * Get status display configuration for document status badges.
 */
export function getStatusConfig(status: string, docType: 'quotation' | 'invoice' = 'quotation') {
  const quotationStatuses: Record<string, { label: string; bgColor: string; textColor: string }> = {
    draft:    { label: 'Draft',    bgColor: '#f3f4f6', textColor: '#6b7280' },
    sent:     { label: 'Sent',     bgColor: '#dbeafe', textColor: '#1d4ed8' },
    approved: { label: 'Approved', bgColor: '#dcfce7', textColor: '#15803d' },
    rejected: { label: 'Rejected', bgColor: '#fee2e2', textColor: '#dc2626' },
    expired:  { label: 'Expired',  bgColor: '#fef3c7', textColor: '#d97706' },
  }

  const invoiceStatuses: Record<string, { label: string; bgColor: string; textColor: string }> = {
    draft:   { label: 'Draft',   bgColor: '#f3f4f6', textColor: '#6b7280' },
    sent:    { label: 'Sent',    bgColor: '#dbeafe', textColor: '#1d4ed8' },
    paid:    { label: 'Paid',    bgColor: '#dcfce7', textColor: '#15803d' },
    overdue: { label: 'Overdue', bgColor: '#fee2e2', textColor: '#dc2626' },
    void:    { label: 'Void',    bgColor: '#f3f4f6', textColor: '#9ca3af' },
  }

  const statuses = docType === 'invoice' ? invoiceStatuses : quotationStatuses
  return statuses[status] || { label: status, bgColor: '#f3f4f6', textColor: '#6b7280' }
}
