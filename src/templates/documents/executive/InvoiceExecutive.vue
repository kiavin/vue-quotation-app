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
const statusConfig = getStatusConfig(props.data.status, 'invoice')
</script>

<template>
  <div class="doc-executive" :style="cssVars">
    <div class="doc-top-accent"></div>

    <div class="doc-body">
      <!-- Header -->
      <header class="doc-header">
        <div class="doc-header-left">
          <img v-if="branding.logo_url" :src="branding.logo_url" alt="Logo" class="doc-logo" />
          <h1 class="doc-company-name">{{ branding.name }}</h1>
          <p class="doc-company-detail" v-if="branding.address">{{ branding.address }}</p>
          <p class="doc-company-detail" v-if="branding.phone">{{ branding.phone }}</p>
          <p class="doc-company-detail" v-if="branding.email">{{ branding.email }}</p>
        </div>
        <div class="doc-header-right">
          <span class="doc-type-label">INVOICE</span>
          <div class="doc-meta-group">
            <div class="doc-meta-item">
              <span class="doc-meta-label">Number</span>
              <span class="doc-meta-value">{{ data.number }}</span>
            </div>
            <div class="doc-meta-item">
              <span class="doc-meta-label">Issue Date</span>
              <span class="doc-meta-value">{{ formatDate(data.issue_date) }}</span>
            </div>
            <div class="doc-meta-item" v-if="data.due_date">
              <span class="doc-meta-label">Due Date</span>
              <span class="doc-meta-value">{{ formatDate(data.due_date) }}</span>
            </div>
            <div class="doc-meta-item">
              <span class="doc-meta-label">Status</span>
              <span
                class="doc-status-badge"
                :style="{ backgroundColor: statusConfig.bgColor, color: statusConfig.textColor }"
              >
                {{ statusConfig.label }}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div class="doc-divider"></div>

      <!-- Client Info -->
      <section class="doc-client-section">
        <h2 class="doc-section-title">Invoice To</h2>
        <div class="doc-client-card">
          <p class="doc-client-name">{{ data.customers?.name }}</p>
          <p class="doc-client-detail" v-if="data.customers?.email">{{ data.customers?.email }}</p>
          <p class="doc-client-detail" v-if="data.customers?.phone">{{ data.customers?.phone }}</p>
          <p class="doc-client-detail" v-if="data.customers?.address">{{ data.customers?.address }}</p>
        </div>
      </section>

      <!-- Items Table -->
      <section class="doc-items-section">
        <table class="doc-table">
          <thead>
            <tr>
              <th class="doc-th doc-th-left">Description</th>
              <th class="doc-th doc-th-right">Qty</th>
              <th class="doc-th doc-th-right">Unit Price</th>
              <th class="doc-th doc-th-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in data.items" :key="item.id || index" class="doc-row">
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
        <div class="doc-totals-box">
          <div class="doc-total-row">
            <span>Subtotal</span>
            <span>{{ formatCurrency(data.subtotal) }}</span>
          </div>
          <div class="doc-total-row" v-if="data.transport_charge > 0">
            <span>Transport</span>
            <span>{{ formatCurrency(data.transport_charge) }}</span>
          </div>
          <div class="doc-total-row" v-if="data.tax_amount > 0">
            <span>Tax ({{ data.tax_rate }}%)</span>
            <span>{{ formatCurrency(data.tax_amount) }}</span>
          </div>
          <div class="doc-total-row" v-if="data.amount_paid > 0">
            <span>Amount Paid</span>
            <span>-{{ formatCurrency(data.amount_paid) }}</span>
          </div>
          <div class="doc-total-grand">
            <span>{{ data.amount_paid > 0 ? 'Balance Due' : 'Total Due' }}</span>
            <span>{{ formatCurrency(data.total - (data.amount_paid || 0)) }}</span>
          </div>
        </div>
      </section>

      <!-- Notes -->
      <section v-if="data.notes" class="doc-notes-section">
        <h2 class="doc-section-title">Notes & Terms</h2>
        <p class="doc-notes-text">{{ data.notes }}</p>
      </section>

      <!-- Footer -->
      <footer class="doc-footer">
        <div class="doc-footer-line"></div>
        <p>Please pay by the due date mentioned above.</p>
        <p class="doc-footer-contact">
          {{ branding.name }}
          <template v-if="branding.email"> · {{ branding.email }}</template>
          <template v-if="branding.phone"> · {{ branding.phone }}</template>
        </p>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.doc-executive {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1a1a1a;
  background: #ffffff;
  min-height: 297mm;
  width: 100%;
  position: relative;
  font-size: 13px;
  line-height: 1.6;
}
.doc-top-accent { height: 4px; background: var(--doc-primary); }
.doc-body { padding: 48px 56px; display: flex; flex-direction: column; min-height: calc(297mm - 4px); }
.doc-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
.doc-header-left { flex: 1; }
.doc-logo { height: 48px; max-width: 180px; object-fit: contain; object-position: left; margin-bottom: 12px; }
.doc-company-name { font-size: 22px; font-weight: 700; letter-spacing: -0.02em; color: #1a1a1a; margin: 0 0 6px 0; }
.doc-company-detail { font-size: 12px; color: #6b7280; margin: 0; line-height: 1.5; }
.doc-header-right { text-align: right; flex-shrink: 0; }
.doc-type-label { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--doc-primary); border-bottom: 2px solid var(--doc-primary); padding-bottom: 4px; margin-bottom: 16px; }
.doc-meta-group { display: flex; flex-direction: column; gap: 8px; }
.doc-meta-item { display: flex; flex-direction: column; align-items: flex-end; }
.doc-meta-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; }
.doc-meta-value { font-size: 13px; font-weight: 600; color: #1a1a1a; }
.doc-status-badge { display: inline-block; padding: 2px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; letter-spacing: 0.03em; }
.doc-divider { height: 1px; background: #e5e7eb; margin-bottom: 28px; }
.doc-section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #9ca3af; margin: 0 0 8px 0; }
.doc-client-section { margin-bottom: 32px; break-inside: avoid; }
.doc-client-card { border-left: 3px solid var(--doc-primary-20); padding-left: 16px; }
.doc-client-name { font-size: 16px; font-weight: 700; color: #1a1a1a; margin: 0 0 4px 0; }
.doc-client-detail { font-size: 12.5px; color: #6b7280; margin: 0; line-height: 1.6; white-space: pre-line; }
.doc-items-section { margin-bottom: 24px; }
.doc-table { width: 100%; border-collapse: collapse; }
.doc-th { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280; padding: 10px 0; border-bottom: 2px solid #e5e7eb; }
.doc-th-left { text-align: left; }
.doc-th-right { text-align: right; }
.doc-row { break-inside: avoid; }

.doc-td { padding: 10px 0; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
.doc-td-right { text-align: right; }
.doc-td-bold { font-weight: 600; }
.doc-item-name { display: block; font-weight: 500; color: #1a1a1a; }
.doc-item-desc { display: block; font-size: 11.5px; color: #9ca3af; margin-top: 2px; }
.doc-totals-section { display: flex; justify-content: flex-end; margin-bottom: 32px; break-inside: avoid; }
.doc-totals-box { width: 260px; }
.doc-total-row { display: flex; justify-content: space-between; font-size: 13px; color: #6b7280; padding: 6px 0; }
.doc-total-grand { display: flex; justify-content: space-between; font-size: 18px; font-weight: 700; color: var(--doc-primary); padding-top: 12px; margin-top: 8px; border-top: 2px solid var(--doc-primary); }
.doc-notes-section { margin-bottom: 32px; break-inside: avoid; }
.doc-notes-text { font-size: 12px; color: #6b7280; white-space: pre-line; line-height: 1.7; margin: 0; }
.doc-footer { margin-top: auto; text-align: center; font-size: 11px; color: #9ca3af; padding-top: 24px; }
.doc-footer-line { height: 1px; background: #e5e7eb; margin-bottom: 16px; }
.doc-footer-contact { margin-top: 4px; font-size: 10.5px; }

@media print {
  .doc-executive { width: 100% !important; max-width: none !important; box-shadow: none !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
}
</style>
