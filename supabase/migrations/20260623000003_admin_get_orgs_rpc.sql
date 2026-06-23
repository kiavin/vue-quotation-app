CREATE OR REPLACE FUNCTION public.admin_get_organizations()
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

  SELECT COALESCE(jsonb_agg(sub.obj), '[]'::jsonb) INTO result
  FROM (
    SELECT jsonb_build_object(
      'id', o.id,
      'name', o.name,
      'status', COALESCE(o.status, 'active'),
      'created_at', o.created_at,
      'owner_email', (
        SELECT u.email 
        FROM public.organization_members om 
        JOIN auth.users u ON om.user_id = u.id 
        WHERE om.organization_id = o.id AND om.role = 'owner' 
        LIMIT 1
      ),
      'total_users', (
        SELECT COUNT(*) 
        FROM public.organization_members 
        WHERE organization_id = o.id
      )
    ) AS obj
    FROM public.organizations o
    ORDER BY o.created_at DESC
  ) sub;

  RETURN result;
END;
$$ LANGUAGE plpgsql;
