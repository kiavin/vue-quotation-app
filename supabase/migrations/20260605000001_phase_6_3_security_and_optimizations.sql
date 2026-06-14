-- ==============================================================================
-- PHASE 6.3 SECURITY & OPTIMIZATIONS
-- ==============================================================================

-- 1. DOCUMENTS BUCKET SECURITY
-- Ensure access is strictly limited to organization members based on the first path segment.
DO $$ BEGIN
    DROP POLICY IF EXISTS "Organization members can view documents" ON storage.objects;
    DROP POLICY IF EXISTS "Organization members can upload documents" ON storage.objects;
    DROP POLICY IF EXISTS "Organization members can update documents" ON storage.objects;
    DROP POLICY IF EXISTS "Organization members can delete documents" ON storage.objects;
END $$;

CREATE POLICY "Organization members can view documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] IN (
    SELECT organization_id::text FROM public.organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Organization members can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] IN (
    SELECT organization_id::text FROM public.organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Organization members can update documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] IN (
    SELECT organization_id::text FROM public.organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Organization members can delete documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] IN (
    SELECT organization_id::text FROM public.organization_members WHERE user_id = auth.uid()
  )
);

-- 2. HARDEN FINANCIAL RECORD SECURITY (QUOTATIONS & INVOICES)
-- Staff and Managers can Read, Create, Update. Cannot Delete.
-- Admins and Owners have full access.

DROP POLICY IF EXISTS "Members can manage quotations" ON public.quotations;

CREATE POLICY "Members can view quotations" 
    ON public.quotations FOR SELECT 
    USING (organization_id IN (SELECT public.user_organizations()) AND deleted_at IS NULL);

CREATE POLICY "Members can insert quotations" 
    ON public.quotations FOR INSERT 
    WITH CHECK (organization_id IN (SELECT public.user_organizations()));

CREATE POLICY "Members can update quotations" 
    ON public.quotations FOR UPDATE 
    USING (organization_id IN (SELECT public.user_organizations()));

CREATE POLICY "Admins and Owners can delete quotations" 
    ON public.quotations FOR DELETE 
    USING (public.is_org_admin(organization_id));

DROP POLICY IF EXISTS "Members can manage invoices" ON public.invoices;

CREATE POLICY "Members can view invoices" 
    ON public.invoices FOR SELECT 
    USING (organization_id IN (SELECT public.user_organizations()) AND deleted_at IS NULL);

CREATE POLICY "Members can insert invoices" 
    ON public.invoices FOR INSERT 
    WITH CHECK (organization_id IN (SELECT public.user_organizations()));

CREATE POLICY "Members can update invoices" 
    ON public.invoices FOR UPDATE 
    USING (organization_id IN (SELECT public.user_organizations()));

CREATE POLICY "Admins and Owners can delete invoices" 
    ON public.invoices FOR DELETE 
    USING (public.is_org_admin(organization_id));

-- 3. INVOICE NUMBER GENERATION (SEQUENCE BASED)
CREATE TABLE IF NOT EXISTS public.invoice_sequences (
    organization_id uuid PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
    last_value int DEFAULT 0
);

CREATE OR REPLACE FUNCTION public.get_next_invoice_number(org_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    next_num int;
    curr_year text;
    inv_number text;
BEGIN
    -- Verify member access
    IF org_id NOT IN (SELECT public.user_organizations()) THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    curr_year := to_char(CURRENT_DATE, 'YYYY');
    
    INSERT INTO public.invoice_sequences (organization_id, last_value)
    VALUES (org_id, 1)
    ON CONFLICT (organization_id) DO UPDATE
    SET last_value = public.invoice_sequences.last_value + 1
    RETURNING last_value INTO next_num;
    
    inv_number := 'INV-' || curr_year || '-' || lpad(next_num::text, 3, '0');
    
    RETURN inv_number;
END;
$$;

-- 4. MULTI-TENANCY OPTIMIZATION
-- Add organization_id to quotation_items
ALTER TABLE public.quotation_items ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Add organization_id to invoice_items
ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Backfill data
UPDATE public.quotation_items qi
SET organization_id = q.organization_id
FROM public.quotations q
WHERE qi.quotation_id = q.id AND qi.organization_id IS NULL;

UPDATE public.invoice_items ii
SET organization_id = i.organization_id
FROM public.invoices i
WHERE ii.invoice_id = i.id AND ii.organization_id IS NULL;

-- Remove orphan rows if any
DELETE FROM public.quotation_items WHERE organization_id IS NULL;
DELETE FROM public.invoice_items WHERE organization_id IS NULL;

-- Make not null
ALTER TABLE public.quotation_items ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE public.invoice_items ALTER COLUMN organization_id SET NOT NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quotation_items_organization_id ON public.quotation_items(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_organization_id ON public.invoice_items(organization_id);

-- Update RLS for nested tables to use simple checks
DROP POLICY IF EXISTS "Quotation items are visible to organization members" ON public.quotation_items;
DROP POLICY IF EXISTS "Members can manage quotation items" ON public.quotation_items;

CREATE POLICY "Quotation items are visible to organization members" 
    ON public.quotation_items FOR SELECT 
    USING (organization_id IN (SELECT public.user_organizations()));

CREATE POLICY "Members can manage quotation items" 
    ON public.quotation_items FOR ALL 
    USING (organization_id IN (SELECT public.user_organizations()));

DROP POLICY IF EXISTS "Invoice items are visible to organization members" ON public.invoice_items;
DROP POLICY IF EXISTS "Members can manage invoice items" ON public.invoice_items;

CREATE POLICY "Invoice items are visible to organization members" 
    ON public.invoice_items FOR SELECT 
    USING (organization_id IN (SELECT public.user_organizations()));

CREATE POLICY "Members can manage invoice items" 
    ON public.invoice_items FOR ALL 
    USING (organization_id IN (SELECT public.user_organizations()));
