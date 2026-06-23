CREATE OR REPLACE FUNCTION public.admin_get_organization_details(org_id_param uuid)
RETURNS jsonb
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  org_data jsonb;
  members_data jsonb;
  logs_data jsonb;
BEGIN
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  -- 1. Get Org Data
  SELECT to_jsonb(o) INTO org_data
  FROM public.organizations o
  WHERE id = org_id_param;

  IF org_data IS NULL THEN
    RETURN NULL;
  END IF;

  -- 2. Get Members with Profiles
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', om.id,
      'user_id', om.user_id,
      'role', om.role,
      'created_at', om.created_at,
      'profiles', to_jsonb(p)
    )
  ), '[]'::jsonb) INTO members_data
  FROM public.organization_members om
  LEFT JOIN public.profiles p ON p.id = om.user_id
  WHERE om.organization_id = org_id_param;

  -- 3. Get Audit Logs
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', al.id,
      'action', al.action,
      'resource', al.resource,
      'created_at', al.created_at
    )
  ), '[]'::jsonb) INTO logs_data
  FROM (
    SELECT * FROM public.audit_logs 
    WHERE organization_id = org_id_param 
    ORDER BY created_at DESC 
    LIMIT 100
  ) al;

  -- Combine
  RETURN org_data || jsonb_build_object(
    'organization_members', members_data,
    'audit_logs', logs_data
  );
END;
$$ LANGUAGE plpgsql;
