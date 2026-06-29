-- Migration to support secure public document links

-- Function to securely fetch a quotation with its items and customer data
CREATE OR REPLACE FUNCTION public.get_public_quotation(doc_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result json;
BEGIN
    SELECT (row_to_json(q.*)::jsonb || 
            jsonb_build_object(
                'customers', row_to_json(c.*),
                'items', (
                    SELECT coalesce(json_agg(row_to_json(qi.*)), '[]'::json)
                    FROM public.quotation_items qi
                    WHERE qi.quotation_id = q.id
                )
            ))::json
    INTO result
    FROM public.quotations q
    LEFT JOIN public.customers c ON c.id = q.customer_id
    WHERE q.id = doc_id AND q.deleted_at IS NULL;

    RETURN result;
END;
$$;

-- Function to securely fetch an invoice with its items and customer data
CREATE OR REPLACE FUNCTION public.get_public_invoice(doc_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result json;
BEGIN
    SELECT (row_to_json(i.*)::jsonb || 
            jsonb_build_object(
                'customers', row_to_json(c.*),
                'items', (
                    SELECT coalesce(json_agg(row_to_json(ii.*)), '[]'::json)
                    FROM public.invoice_items ii
                    WHERE ii.invoice_id = i.id
                )
            ))::json
    INTO result
    FROM public.invoices i
    LEFT JOIN public.customers c ON c.id = i.customer_id
    WHERE i.id = doc_id AND i.deleted_at IS NULL;

    RETURN result;
END;
$$;
