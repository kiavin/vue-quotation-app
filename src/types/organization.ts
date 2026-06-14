export interface Organization {
  id: string
  name: string
  slug: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
  accent_color: string
  address: string | null
  phone: string | null
  email: string | null
  default_tax_rate: number
  currency: string
  created_at?: string
  updated_at?: string
  member_count?: number
  customer_count?: number
  quotation_count?: number
  invoice_count?: number
}

export interface BrandingSnapshot {
  name: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
  accent_color: string
  address: string | null
  phone: string | null
  email: string | null
}
