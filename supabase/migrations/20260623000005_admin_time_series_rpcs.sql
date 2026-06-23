CREATE OR REPLACE FUNCTION public.admin_get_time_series_metrics()
RETURNS jsonb
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  WITH months AS (
    SELECT generate_series(
      date_trunc('month', CURRENT_DATE - INTERVAL '5 months'),
      date_trunc('month', CURRENT_DATE),
      '1 month'::interval
    ) AS month
  ),
  monthly_quotes AS (
    SELECT 
      date_trunc('month', date) AS month,
      COUNT(*) as count
    FROM public.quotations
    WHERE deleted_at IS NULL
    GROUP BY 1
  ),
  monthly_invoices AS (
    SELECT 
      date_trunc('month', issue_date) AS month,
      COUNT(*) as count,
      SUM(total) as revenue
    FROM public.invoices
    WHERE deleted_at IS NULL
    GROUP BY 1
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'month', to_char(m.month, 'Mon YYYY'),
      'quotes', COALESCE(mq.count, 0),
      'invoices', COALESCE(mi.count, 0),
      'revenue', COALESCE(mi.revenue, 0)
    )
    ORDER BY m.month ASC
  ) INTO result
  FROM months m
  LEFT JOIN monthly_quotes mq ON m.month = mq.month
  LEFT JOIN monthly_invoices mi ON m.month = mi.month;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;
