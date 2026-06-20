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
  <div class="doc-modern" :style="cssVars">
    <div class="doc-header-block">
      <div class="doc-header-content">
        <div class="doc-header-left">
          <img v-if="branding.logo_url" :src="branding.logo_url" alt="Logo" class="doc-logo" />
          <div>
            <h1 class="doc-company-name">{{ branding.name }}</h1>
            <p class="doc-company-info" v-if="branding.address">{{ branding.address }}</p>
            <p class="doc-company-info">
              <template v-if="branding.email">{{ branding.email }}</template>
              <template v-if="branding.phone"> · {{ branding.phone }}</template>
            </p>
          </div>
        </div>
        <div class="doc-header-right">
          <div class="doc-type-label">Invoice</div>
          <div class="doc-header-number">{{ data.number }}</div>
        </div>
      </div>
    </div>

    <div class="doc-body">
      <div class="doc-meta-row">
        <div class="doc-meta-card">
          <span class="doc-meta-label">Issue Date</span>
          <span class="doc-meta-value">{{ formatDate(data.issue_date) }}</span>
        </div>
        <div class="doc-meta-card" v-if="data.due_date">
          <span class="doc-meta-label">Due Date</span>
          <span class="doc-meta-value">{{ formatDate(data.due_date) }}</span>
        </div>
        <div class="doc-meta-card">
          <span class="doc-meta-label">Status</span>
          <span
            class="doc-status-chip"
            :style="{ backgroundColor: statusConfig.bgColor, color: statusConfig.textColor }"
          >
            {{ statusConfig.label }}
          </span>
        </div>
      </div>

      <div class="doc-client-card">
        <div class="doc-card-accent"></div>
        <div class="doc-card-body">
          <h2 class="doc-card-title">Billed To</h2>
          <p class="doc-client-name">{{ data.customers?.name }}</p>
          <div class="doc-client-details">
            <span v-if="data.customers?.email">{{ data.customers?.email }}</span>
            <span v-if="data.customers?.phone">{{ data.customers?.phone }}</span>
            <span v-if="data.customers?.address">{{ data.customers?.address }}</span>
          </div>
        </div>
      </div>

      <section class="doc-items-section">
        <h2 class="doc-section-title">Line Items</h2>
        <div class="doc-table-wrapper">
          <table class="doc-table">
            <thead>
              <tr>
                <th class="doc-th doc-th-left">Item</th>
                <th class="doc-th doc-th-center">Qty</th>
                <th class="doc-th doc-th-right">Price</th>
                <th class="doc-th doc-th-right">Total</th>
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
        </div>
      </section>

      <section class="doc-totals-section">
        <div class="doc-totals-card">
          <div class="doc-totals-accent"></div>
          <div class="doc-totals-body">
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
        </div>
      </section>

      <section v-if="data.notes" class="doc-notes-section">
        <h2 class="doc-section-title">Payment Terms</h2>
        <div class="doc-notes-card">
          <p class="doc-notes-text">{{ data.notes }}</p>
        </div>
      </section>

      <footer class="doc-footer">
        <div class="doc-footer-divider"></div>
        <p class="doc-footer-message">Please pay by the due date mentioned above.</p>
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
.doc-modern { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a1a; background: #ffffff; min-height: 297mm; width: 100%; font-size: 13px; line-height: 1.6; }
.doc-header-block { background: var(--doc-primary); padding: 36px 56px; }
.doc-header-content { display: flex; justify-content: space-between; align-items: center; }
.doc-header-left { display: flex; align-items: center; gap: 16px; flex: 1; }
.doc-logo { height: 44px; max-width: 100px; object-fit: contain; border-radius: 6px; }
.doc-company-name { font-size: 20px; font-weight: 700; color: var(--doc-primary-contrast); margin: 0; }
.doc-company-info { font-size: 11.5px; color: var(--doc-primary-contrast); opacity: 0.8; margin: 2px 0 0 0; }
.doc-header-right { text-align: right; flex-shrink: 0; }
.doc-type-label { font-size: 13px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--doc-primary-contrast); opacity: 0.8; }
.doc-header-number { font-size: 22px; font-weight: 800; color: var(--doc-primary-contrast); margin-top: 2px; }
.doc-body { padding: 32px 56px 40px; display: flex; flex-direction: column; min-height: calc(297mm - 100px); }
.doc-meta-row { display: flex; gap: 12px; margin-bottom: 24px; }
.doc-meta-card { flex: 1; padding: 12px 16px; border-radius: 8px; background: var(--doc-surface, #f9fafb); border: 1px solid var(--doc-border-light, #f3f4f6); display: flex; flex-direction: column; gap: 4px; }
.doc-meta-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; }
.doc-meta-value { font-size: 13px; font-weight: 600; color: #1a1a1a; }
.doc-status-chip { display: inline-block; padding: 3px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; width: fit-content; }
.doc-client-card { display: flex; margin-bottom: 28px; border-radius: 10px; overflow: hidden; border: 1px solid var(--doc-border-light, #f3f4f6); break-inside: avoid; }
.doc-card-accent { width: 5px; background: var(--doc-primary); flex-shrink: 0; }
.doc-card-body { padding: 18px 20px; flex: 1; }
.doc-card-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--doc-primary); margin: 0 0 8px 0; }
.doc-client-name { font-size: 16px; font-weight: 700; color: #1a1a1a; margin: 0 0 6px 0; }
.doc-client-details { display: flex; flex-direction: column; gap: 1px; font-size: 12px; color: #6b7280; }
.doc-section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--doc-primary); margin: 0 0 12px 0; }
.doc-items-section { margin-bottom: 24px; }
.doc-table-wrapper { border-radius: 10px; overflow: hidden; border: 1px solid var(--doc-border-light, #f3f4f6); }
.doc-table { width: 100%; border-collapse: collapse; }
.doc-th { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 12px 16px; background: var(--doc-primary-8, #f8f9fa); color: var(--doc-primary-80, #374151); border-bottom: 1px solid var(--doc-border, #e5e7eb); }
.doc-th-left { text-align: left; } .doc-th-center { text-align: center; } .doc-th-right { text-align: right; }
.doc-row { break-inside: avoid; }

.doc-td { padding: 11px 16px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
.doc-td-center { text-align: center; } .doc-td-right { text-align: right; } .doc-td-bold { font-weight: 600; }
.doc-item-name { display: block; font-weight: 500; color: #1a1a1a; }
.doc-item-desc { display: block; font-size: 11px; color: #9ca3af; margin-top: 2px; }
.doc-totals-section { display: flex; justify-content: flex-end; margin-bottom: 28px; break-inside: avoid; }
.doc-totals-card { display: flex; width: 300px; border-radius: 10px; overflow: hidden; border: 1px solid var(--doc-border-light, #f3f4f6); }
.doc-totals-accent { width: 5px; background: var(--doc-primary); flex-shrink: 0; }
.doc-totals-body { flex: 1; padding: 18px 20px; }
.doc-total-row { display: flex; justify-content: space-between; font-size: 13px; color: #6b7280; padding: 5px 0; }
.doc-total-grand { display: flex; justify-content: space-between; font-size: 20px; font-weight: 800; color: var(--doc-primary); padding-top: 14px; margin-top: 10px; border-top: 2px solid var(--doc-primary-15); }
.doc-notes-section { margin-bottom: 28px; break-inside: avoid; }
.doc-notes-card { padding: 16px 20px; background: var(--doc-surface, #f9fafb); border-radius: 10px; border: 1px solid var(--doc-border-light, #f3f4f6); }
.doc-notes-text { font-size: 12px; color: #6b7280; white-space: pre-line; line-height: 1.7; margin: 0; }
.doc-footer { margin-top: auto; text-align: center; padding-top: 20px; }
.doc-footer-divider { height: 1px; background: var(--doc-border, #e5e7eb); margin-bottom: 16px; }
.doc-footer-message { font-size: 12px; color: #6b7280; margin: 0 0 4px 0; }
.doc-footer-contact { font-size: 11px; color: #9ca3af; margin: 0; }

@media print {
  .doc-modern { width: 100% !important; max-width: none !important; box-shadow: none !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
}
</style>
