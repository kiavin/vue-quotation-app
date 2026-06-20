<script setup lang="ts">
import type { BrandingSnapshot } from '@/types/organization'
import { useDocumentColors } from '@/composables/useDocumentColors'
import { useDocumentFormat, getStatusConfig } from '@/composables/useDocumentFormat'

export interface Props {
  data: any
  branding: BrandingSnapshot
}

const props = defineProps<Props>()
const { cssVars } = useDocumentColors(() => props.branding)
const { formatCurrency, formatDate } = useDocumentFormat(() => props.branding)
const statusConfig = getStatusConfig(props.data.status, 'quotation')
</script>

<template>
  <div class="doc-classic" :style="cssVars">
    <div class="doc-body">
      <!-- Header -->
      <header class="doc-header">
        <div class="doc-header-left">
          <img v-if="branding.logo_url" :src="branding.logo_url" alt="Logo" class="doc-logo" />
          <h1 class="doc-company-name">{{ branding.name }}</h1>
          <div class="doc-company-details">
            <p v-if="branding.address">{{ branding.address }}</p>
            <p v-if="branding.phone">Tel: {{ branding.phone }}</p>
            <p v-if="branding.email">{{ branding.email }}</p>
          </div>
        </div>
        <div class="doc-header-right">
          <div class="doc-type-block">
            <span class="doc-type-text">QUOTATION</span>
          </div>
        </div>
      </header>

      <div class="doc-header-rule"></div>

      <!-- Two-Column Info -->
      <div class="doc-info-columns">
        <div class="doc-info-left">
          <h2 class="doc-info-heading">Quotation For:</h2>
          <p class="doc-client-name">{{ data.customers?.name || data.customer?.name }}</p>
          <p class="doc-client-line" v-if="data.customers?.email || data.customer?.email">
            {{ data.customers?.email || data.customer?.email }}
          </p>
          <p class="doc-client-line" v-if="data.customers?.phone || data.customer?.phone">
            Tel: {{ data.customers?.phone || data.customer?.phone }}
          </p>
          <p class="doc-client-line" v-if="data.customers?.address || data.customer?.address">
            {{ data.customers?.address || data.customer?.address }}
          </p>
        </div>
        <div class="doc-info-right">
          <table class="doc-info-table">
            <tr>
              <td class="doc-info-label">Quotation No.</td>
              <td class="doc-info-value">{{ data.number }}</td>
            </tr>
            <tr>
              <td class="doc-info-label">Date</td>
              <td class="doc-info-value">{{ formatDate(data.date) }}</td>
            </tr>
            <tr v-if="data.expiry_date">
              <td class="doc-info-label">Valid Until</td>
              <td class="doc-info-value">{{ formatDate(data.expiry_date) }}</td>
            </tr>
            <tr>
              <td class="doc-info-label">Status</td>
              <td class="doc-info-value">
                <span
                  class="doc-status"
                  :style="{ backgroundColor: statusConfig.bgColor, color: statusConfig.textColor }"
                >{{ statusConfig.label }}</span>
              </td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Items Table -->
      <section class="doc-items-section">
        <table class="doc-table">
          <thead>
            <tr>
              <th class="doc-th" style="width: 5%">#</th>
              <th class="doc-th doc-th-left">Description</th>
              <th class="doc-th doc-th-right" style="width: 10%">Qty</th>
              <th class="doc-th doc-th-right" style="width: 18%">Unit Price</th>
              <th class="doc-th doc-th-right" style="width: 18%">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in data.items"
              :key="item.id || index"
              class="doc-row"
            >
              <td class="doc-td doc-td-center doc-td-num">{{ Number(index) + 1 }}</td>
              <td class="doc-td">
                <span class="doc-item-name">{{ item.name }}</span>
                <span class="doc-item-desc" v-if="item.description">{{ item.description }}</span>
              </td>
              <td class="doc-td doc-td-right">{{ item.quantity }}</td>
              <td class="doc-td doc-td-right">{{ formatCurrency(item.price) }}</td>
              <td class="doc-td doc-td-right doc-td-bold">{{ formatCurrency(item.total) }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- Totals -->
      <section class="doc-totals-section">
        <div class="doc-totals-table">
          <div class="doc-total-row">
            <span class="doc-total-label">Subtotal</span>
            <span class="doc-total-value">{{ formatCurrency(data.subtotal) }}</span>
          </div>
          <div class="doc-total-row" v-if="data.transport_charge > 0">
            <span class="doc-total-label">Transport Charge</span>
            <span class="doc-total-value">{{ formatCurrency(data.transport_charge) }}</span>
          </div>
          <div class="doc-total-row" v-if="data.tax_amount > 0">
            <span class="doc-total-label">Tax ({{ data.tax_rate }}%)</span>
            <span class="doc-total-value">{{ formatCurrency(data.tax_amount) }}</span>
          </div>
          <div class="doc-total-grand-row">
            <span class="doc-total-grand-label">TOTAL</span>
            <span class="doc-total-grand-value">{{ formatCurrency(data.total) }}</span>
          </div>
        </div>
      </section>

      <!-- Notes -->
      <section v-if="data.notes" class="doc-notes-section">
        <h3 class="doc-notes-heading">Terms & Conditions</h3>
        <div class="doc-notes-box">
          <p class="doc-notes-text">{{ data.notes }}</p>
        </div>
      </section>

      <!-- Signature Area -->
      <section class="doc-signature-section">
        <div class="doc-signature-grid">
          <div class="doc-signature-block">
            <div class="doc-signature-line"></div>
            <p class="doc-signature-label">Authorized Signature</p>
          </div>
          <div class="doc-signature-block">
            <div class="doc-signature-line"></div>
            <p class="doc-signature-label">Client Signature</p>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="doc-footer">
        <div class="doc-footer-rule"></div>
        <p>{{ branding.name }}
          <template v-if="branding.email"> | {{ branding.email }}</template>
          <template v-if="branding.phone"> | {{ branding.phone }}</template>
        </p>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.doc-classic {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1a1a1a;
  background: #ffffff;
  min-height: 297mm;
  width: 100%;
  font-size: 13px;
  line-height: 1.5;
}

.doc-body { padding: 48px 56px; display: flex; flex-direction: column; min-height: 297mm; }

/* ── Header ── */
.doc-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
.doc-header-left { flex: 1; }
.doc-logo { height: 50px; max-width: 180px; object-fit: contain; object-position: left; margin-bottom: 10px; }
.doc-company-name { font-size: 22px; font-weight: 700; margin: 0 0 6px 0; color: #1a1a1a; }
.doc-company-details p { font-size: 11.5px; color: #6b7280; margin: 0; line-height: 1.6; }
.doc-header-right { flex-shrink: 0; }
.doc-type-block {
  padding: 10px 28px;
  background: var(--doc-primary);
  color: var(--doc-primary-contrast);
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-align: center;
}
.doc-type-text { display: block; }

.doc-header-rule { height: 3px; background: var(--doc-primary); margin-bottom: 24px; }

/* ── Info Columns ── */
.doc-info-columns { display: flex; justify-content: space-between; gap: 40px; margin-bottom: 28px; break-inside: avoid; }
.doc-info-left { flex: 1; }
.doc-info-right { flex-shrink: 0; }
.doc-info-heading { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; margin: 0 0 8px 0; }
.doc-client-name { font-size: 16px; font-weight: 700; margin: 0 0 4px 0; }
.doc-client-line { font-size: 12.5px; color: #6b7280; margin: 0; line-height: 1.6; white-space: pre-line; }

.doc-info-table { border-collapse: collapse; }
.doc-info-table td { padding: 4px 0; font-size: 12.5px; }
.doc-info-label { color: #9ca3af; font-weight: 500; padding-right: 20px; white-space: nowrap; }
.doc-info-value { font-weight: 600; color: #1a1a1a; text-align: right; }
.doc-status { display: inline-block; padding: 2px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; }

/* ── Table ── */
.doc-items-section { margin-bottom: 4px; }
.doc-table { width: 100%; border-collapse: collapse; }
.doc-th {
  font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
  padding: 10px 8px; background: var(--doc-primary); color: var(--doc-primary-contrast);
  border: 1px solid var(--doc-primary-70, #374151);
}
.doc-th-left { text-align: left; }
.doc-th-right { text-align: right; }
.doc-row { break-inside: avoid; }

.doc-td {
  padding: 9px 8px; border-bottom: 1px solid #e5e7eb;
  border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;
  vertical-align: top;
}
.doc-td-center { text-align: center; }
.doc-td-right { text-align: right; }
.doc-td-bold { font-weight: 600; }
.doc-td-num { color: #9ca3af; font-size: 12px; }
.doc-item-name { display: block; font-weight: 500; }
.doc-item-desc { display: block; font-size: 11px; color: #9ca3af; margin-top: 1px; }

/* ── Totals ── */
.doc-totals-section { display: flex; justify-content: flex-end; margin-bottom: 28px; break-inside: avoid; }
.doc-totals-table { width: 280px; border: 1px solid #e5e7eb; }
.doc-total-row { display: flex; justify-content: space-between; padding: 8px 14px; font-size: 13px; color: #6b7280; border-bottom: 1px solid #f3f4f6; }
.doc-total-label { font-weight: 500; }
.doc-total-value { font-weight: 600; color: #1a1a1a; }
.doc-total-grand-row {
  display: flex; justify-content: space-between; padding: 12px 14px;
  background: var(--doc-primary); color: var(--doc-primary-contrast);
  font-weight: 800; font-size: 16px;
}
.doc-total-grand-label { letter-spacing: 0.08em; }

/* ── Notes ── */
.doc-notes-section { margin-bottom: 28px; break-inside: avoid; }
.doc-notes-heading { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #374151; margin: 0 0 8px 0; border-bottom: 2px solid var(--doc-primary-20); padding-bottom: 4px; display: inline-block; }
.doc-notes-box { padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 4px; background: #fafbfc; }
.doc-notes-text { font-size: 12px; color: #6b7280; white-space: pre-line; line-height: 1.7; margin: 0; }

/* ── Signature ── */
.doc-signature-section { margin-bottom: 32px; break-inside: avoid; }
.doc-signature-grid { display: flex; gap: 60px; }
.doc-signature-block { flex: 1; }
.doc-signature-line { border-bottom: 1px solid #1a1a1a; margin-bottom: 8px; height: 40px; }
.doc-signature-label { font-size: 11px; color: #9ca3af; margin: 0; }

/* ── Footer ── */
.doc-footer { margin-top: auto; text-align: center; font-size: 11px; color: #9ca3af; }
.doc-footer-rule { height: 2px; background: var(--doc-primary-20); margin-bottom: 12px; }

@media print {
  .doc-classic { width: 100% !important; max-width: none !important; box-shadow: none !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
}
</style>
