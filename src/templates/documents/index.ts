import QuotationExecutive from './executive/QuotationExecutive.vue'
import InvoiceExecutive from './executive/InvoiceExecutive.vue'
import QuotationElegant from './elegant/QuotationElegant.vue'
import InvoiceElegant from './elegant/InvoiceElegant.vue'
import QuotationModern from './modern/QuotationModern.vue'
import InvoiceModern from './modern/InvoiceModern.vue'
import QuotationClassic from './classic/QuotationClassic.vue'
import InvoiceClassic from './classic/InvoiceClassic.vue'

export const TEMPLATE_VARIANTS = {
  modern: {
    id: 'modern',
    label: 'Modern SaaS',
    description: 'Clean card-based layout with full-width headers.',
    quotation: QuotationModern,
    invoice: InvoiceModern,
  },
  executive: {
    id: 'executive',
    label: 'Executive',
    description: 'Minimal, high-contrast, corporate aesthetic.',
    quotation: QuotationExecutive,
    invoice: InvoiceExecutive,
  },
  elegant: {
    id: 'elegant',
    label: 'Elegant',
    description: 'Premium serif typography with gradient accents.',
    quotation: QuotationElegant,
    invoice: InvoiceElegant,
  },
  classic: {
    id: 'classic',
    label: 'Classic Business',
    description: 'Traditional column layout with strict table borders.',
    quotation: QuotationClassic,
    invoice: InvoiceClassic,
  },
} as const

export type TemplateVariantId = keyof typeof TEMPLATE_VARIANTS

export const DEFAULT_TEMPLATE: TemplateVariantId = 'modern'