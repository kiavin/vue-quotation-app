-- RPC to safely convert an approved quotation to a draft invoice
CREATE OR REPLACE FUNCTION public.convert_quotation_to_invoice(
    p_quotation_id UUID,
    p_org_id UUID
) RETURNS UUID AS $$
DECLARE
    v_invoice_id UUID;
    v_quotation public.quotations%ROWTYPE;
BEGIN
    -- 1. Fetch quotation and verify authorization
    SELECT * INTO v_quotation
    FROM public.quotations
    WHERE id = p_quotation_id AND organization_id = p_org_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Quotation not found or you do not have permission to access it.';
    END IF;

    -- 2. Insert new invoice with snapshotted branding and totals
    INSERT INTO public.invoices (
        organization_id, customer_id, quotation_id, subtotal, total, branding_snapshot, status
    ) VALUES (
        p_org_id, v_quotation.customer_id, v_quotation.id, v_quotation.subtotal, v_quotation.total, v_quotation.branding_snapshot, 'draft'
    ) RETURNING id INTO v_invoice_id;

    -- 3. Copy items
    INSERT INTO public.invoice_items (
        invoice_id, catalog_item_id, name, quantity, price
    )
    SELECT v_invoice_id, catalog_item_id, name, quantity, price
    FROM public.quotation_items
    WHERE quotation_id = p_quotation_id;

    -- 4. Update the quotation status
    UPDATE public.quotations SET status = 'invoiced' WHERE id = p_quotation_id;

    RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;