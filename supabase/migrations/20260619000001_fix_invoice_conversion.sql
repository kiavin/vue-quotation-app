-- Fix the convert_quotation_to_invoice RPC to properly populate invoices and invoice_items

CREATE OR REPLACE FUNCTION public.convert_quotation_to_invoice(
    p_quotation_id UUID,
    p_org_id UUID
) RETURNS UUID AS $$
DECLARE
    v_invoice_id UUID;
    v_quotation public.quotations%ROWTYPE;
    v_invoice_number TEXT;
BEGIN
    -- 1. Fetch quotation and verify authorization
    SELECT * INTO v_quotation
    FROM public.quotations
    WHERE id = p_quotation_id AND organization_id = p_org_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Quotation not found or you do not have permission to access it.';
    END IF;

    -- 2. Generate a new invoice number using the sequence function
    v_invoice_number := public.get_next_invoice_number(p_org_id);

    -- 3. Insert new invoice with snapshotted branding and totals, including tax and notes
    INSERT INTO public.invoices (
        organization_id, customer_id, quotation_id, 
        number, issue_date,
        subtotal, transport_charge, tax_rate, tax_amount, total, 
        notes, branding_snapshot, status
    ) VALUES (
        p_org_id, 
        v_quotation.customer_id, 
        v_quotation.id, 
        v_invoice_number,
        CURRENT_DATE,
        v_quotation.subtotal, 
        v_quotation.transport_charge, 
        v_quotation.tax_rate, 
        v_quotation.tax_amount, 
        v_quotation.total, 
        v_quotation.notes, 
        v_quotation.branding_snapshot, 
        'draft'
    ) RETURNING id INTO v_invoice_id;

    -- 4. Copy items (include organization_id to satisfy constraints and RLS, and fix columns)
    INSERT INTO public.invoice_items (
        invoice_id, organization_id, name, quantity, price, total
    )
    SELECT v_invoice_id, p_org_id, name, quantity, price, total
    FROM public.quotation_items
    WHERE quotation_id = p_quotation_id;

    -- 5. Note: We do not update the quotation status to 'invoiced' because it violates the CHECK constraint.
    -- The frontend uses `quotation_id` on the invoice to link them.
    
    RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
