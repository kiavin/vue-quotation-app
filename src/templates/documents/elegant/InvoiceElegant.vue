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
  <div class="doc-elegant" :style="cssVars">
    <div class="doc-header-band">
      <div class="doc-header-inner">
        <div class="doc-header-left">
          <img v-if="branding.logo_url" :src="branding.logo_url" alt="Logo" class="doc-logo" />
          <h1 class="doc-company-name">{{ branding.name }}</h1>
          <p class="doc-company-tagline" v-if="branding.address">{{ branding.address }}</p>
        </div>
        <div class="doc-header-right">
          <div class="doc-type-badge">Invoice</div>
          <div class="doc-number">{{ data.number }}</div>
        </div>
      </div>
    </div>

    <div class="doc-body">
      <div class="doc-info-grid">
        <div class="doc-info-card">
          <h2 class="doc-card-label">Billed To</h2>
          <p class="doc-client-name">{{ data.customers?.name }}</p>
          <p class="doc-client-detail" v-if="data.customers?.email">{{ data.customers?.email }}</p>
          <p class="doc-client-detail" v-if="data.customers?.phone">{{ data.customers?.phone }}</p>
          <p class="doc-client-detail" v-if="data.customers?.address">{{ data.customers?.address }}</p>
        </div>
        <div class="doc-info-card">
          <h2 class="doc-card-label">Invoice Details</h2>
          <div class="doc-detail-row">
            <span class="doc-detail-label">Issue Date</span>
            <span class="doc-detail-value">{{ formatDate(data.issue_date) }}</span>
          </div>
          <div class="doc-detail-row" v-if="data.due_date">
            <span class="doc-detail-label">Due Date</span>
            <span class="doc-detail-value">{{ formatDate(data.due_date) }}</span>
          </div>
          <div class="doc-detail-row">
            <span class="doc-detail-label">Status</span>
            <span
              class="doc-status-pill"
              :style="{ backgroundColor: statusConfig.bgColor, color: statusConfig.textColor }"
            >
              {{ statusConfig.label }}
            </span>
          </div>
          <div class="doc-detail-row">
            <span class="doc-detail-label">Contact</span>
            <span class="doc-detail-value">{{ branding.email || branding.phone }}</span>
          </div>
        </div>
      </div>

      <div class="doc-ornamental-divider">
        <span class="doc-ornament-line"></span>
        <span class="doc-ornament-diamond">◆</span>
        <span class="doc-ornament-line"></span>
      </div>

      <section class="doc-items-section">
        <table class="doc-table">
          <thead>
            <tr>
              <th class="doc-th doc-th-left">Item</th>
              <th class="doc-th doc-th-center">Qty</th>
              <th class="doc-th doc-th-right">Price</th>
              <th class="doc-th doc-th-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in data.items" :key="item.id || index" class="doc-row">
              <td class="doc-td">
                <span class="doc-item-name">{{ item.name }}</span>
                <span class="doc-item-desc" v-if="item.description">{{ item.description }}</span>
              </td>
              <td class="doc-td doc-td-center">{{ item.quantity }}</td>
              <td class="doc-td doc-td-right">{{ formatCurrency(item.price) }}</td>
              <td class="doc-td doc-td-right doc-td-bold">{{ formatCurrency(item.total) }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="doc-totals-section">
        <div class="doc-totals-card">
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

      <section v-if="data.notes" class="doc-notes-section">
        <h2 class="doc-section-heading">Payment Terms</h2>
        <p class="doc-notes-text">{{ data.notes }}</p>
      </section>

      <footer class="doc-footer">
        <div class="doc-footer-ornament">
          <span class="doc-ornament-line"></span>
          <span class="doc-ornament-diamond">◆</span>
          <span class="doc-ornament-line"></span>
        </div>
        <p class="doc-footer-thanks">Thank you for your business</p>
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
.doc-elegant { font-family: 'Inter', Georgia, 'Times New Roman', serif; color: #1a1a1a; background: #ffffff; min-height: 297mm; width: 100%; font-size: 13px; line-height: 1.6; }
.doc-header-band { background: linear-gradient(135deg, var(--doc-primary-8) 0%, var(--doc-secondary-8, var(--doc-primary-5)) 100%); padding: 40px 56px 36px; border-bottom: 1px solid var(--doc-primary-20); }
.doc-header-inner { display: flex; justify-content: space-between; align-items: flex-start; }
.doc-header-left { flex: 1; }
.doc-logo { height: 52px; max-width: 200px; object-fit: contain; object-position: left; margin-bottom: 12px; }
.doc-company-name { font-size: 24px; font-weight: 700; color: var(--doc-primary-90, #1a1a1a); margin: 0 0 4px 0; }
.doc-company-tagline { font-size: 12px; color: var(--doc-primary-soft-contrast, #6b7280); margin: 0; font-style: italic; }
.doc-header-right { text-align: right; flex-shrink: 0; }
.doc-type-badge { display: inline-block; padding: 6px 20px; background: var(--doc-primary); color: var(--doc-primary-contrast); font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; border-radius: 24px; margin-bottom: 10px; }
.doc-number { font-size: 15px; font-weight: 700; color: var(--doc-primary-90, #1a1a1a); }
.doc-body { padding: 36px 56px 40px; display: flex; flex-direction: column; min-height: calc(297mm - 120px); }
.doc-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
.doc-info-card { padding: 20px; border: 1px solid var(--doc-primary-15, #e5e7eb); border-radius: 12px; background: var(--doc-primary-5, #fafbfc); }
.doc-card-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--doc-primary); margin: 0 0 10px 0; }
.doc-client-name { font-size: 16px; font-weight: 700; color: #1a1a1a; margin: 0 0 4px 0; }
.doc-client-detail { font-size: 12px; color: #6b7280; margin: 0; line-height: 1.6; white-space: pre-line; }
.doc-detail-row { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; font-size: 12.5px; }
.doc-detail-label { color: #9ca3af; font-weight: 500; }
.doc-detail-value { font-weight: 600; color: #1a1a1a; }
.doc-status-pill { display: inline-block; padding: 2px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; }
.doc-ornamental-divider, .doc-footer-ornament { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }
.doc-ornament-line { flex: 1; height: 1px; background: linear-gradient(to right, transparent, var(--doc-primary-20), transparent); }
.doc-ornament-diamond { color: var(--doc-primary-30, #d1d5db); font-size: 8px; flex-shrink: 0; }
.doc-items-section { margin-bottom: 24px; }
.doc-table { width: 100%; border-collapse: collapse; }
.doc-th { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding: 12px 8px; color: var(--doc-primary-contrast); background: var(--doc-primary); }
.doc-th:first-child { border-radius: 8px 0 0 0; }
.doc-th:last-child { border-radius: 0 8px 0 0; }
.doc-th-left { text-align: left; }
.doc-th-center { text-align: center; }
.doc-th-right { text-align: right; }
.doc-row { break-inside: avoid; }

.doc-td { padding: 10px 8px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
.doc-td-center { text-align: center; }
.doc-td-right { text-align: right; }
.doc-td-bold { font-weight: 600; }
.doc-item-name { display: block; font-weight: 500; color: #1a1a1a; }
.doc-item-desc { display: block; font-size: 11px; color: #9ca3af; margin-top: 2px; font-style: italic; }
.doc-totals-section { display: flex; justify-content: flex-end; margin-bottom: 32px; break-inside: avoid; }
.doc-totals-card { width: 280px; padding: 20px; border: 1px solid var(--doc-primary-15, #e5e7eb); border-radius: 12px; background: var(--doc-primary-5, #fafbfc); }
.doc-total-row { display: flex; justify-content: space-between; font-size: 13px; color: #6b7280; padding: 5px 0; }
.doc-total-grand { display: flex; justify-content: space-between; font-size: 18px; font-weight: 700; color: var(--doc-primary); padding-top: 12px; margin-top: 8px; border-top: 2px solid var(--doc-primary-20); }
.doc-section-heading { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--doc-primary); margin: 0 0 8px 0; }
.doc-notes-section { margin-bottom: 32px; break-inside: avoid; }
.doc-notes-text { font-size: 12px; color: #6b7280; white-space: pre-line; line-height: 1.7; margin: 0; }
.doc-footer { margin-top: auto; text-align: center; padding-top: 24px; }
.doc-footer-ornament { margin-bottom: 12px; }
.doc-footer-thanks { font-size: 13px; font-style: italic; color: var(--doc-primary-70, #4a5568); margin: 0 0 4px 0; }
.doc-footer-contact { font-size: 11px; color: #9ca3af; margin: 0; }

@media print {
  .doc-elegant { width: 100% !important; max-width: none !important; box-shadow: none !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
}
</style>
