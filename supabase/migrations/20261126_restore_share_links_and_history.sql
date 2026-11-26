-- CLOVER DIGITAL / Reparación de enlaces y actividad compartida
-- No borra ni sustituye tokens, accesos, producciones o eventos.
-- EJECUTAR ANTES de publicar el frontend de este cambio.

-- 1. Enlaces del titular, sin datos de los visitantes.
--    Consultamos production_shares directamente: no dependemos del RPC
--    antiguo de 12 columnas ni de los permisos que se le apliquen.
CREATE OR REPLACE FUNCTION public.list_production_share_links_safe(
  p_production_id uuid
)
RETURNS TABLE (
  share_token text,
  created_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    s.token::text,
    s.created_at,
    s.expires_at,
    s.revoked_at
  FROM public.production_shares AS s
  JOIN public.productions AS p ON p.id = s.production_id
  WHERE auth.uid() IS NOT NULL
    AND s.production_id = p_production_id
    AND s.owner_id = auth.uid()
    AND p.user_id = auth.uid()
  ORDER BY s.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.list_production_share_links_safe(uuid)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_production_share_links_safe(uuid)
  TO authenticated;

-- 2. Producciones que el usuario abrió desde un enlace válido.
--    Son solo accesos de lectura, NO membresías ni titularidades.
--    No devuelve importe, pagos, titular, ni datos de otras personas.
CREATE OR REPLACE FUNCTION public.list_my_shared_productions()
RETURNS TABLE (
  share_token text,
  property_name text,
  property_address text,
  expires_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT DISTINCT ON (p.id)
    s.token::text,
    p.property_name::text,
    p.property_address::text,
    LEAST(s.expires_at, COALESCE(p.available_until, s.expires_at)) AS expires_at
  FROM public.production_share_access AS a
  JOIN public.production_shares AS s ON s.token = a.token
  JOIN public.productions AS p ON p.id = s.production_id
  WHERE auth.uid() IS NOT NULL
    AND a.user_id = auth.uid()
    AND s.revoked_at IS NULL
    AND s.expires_at > now()
    AND p.status = 'delivered'
    AND (p.available_until IS NULL OR p.available_until > now())
    AND p.user_id = s.owner_id
    AND p.user_id IS DISTINCT FROM auth.uid()
  ORDER BY p.id, a.last_viewed_at DESC;
$$;

REVOKE ALL ON FUNCTION public.list_my_shared_productions()
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_my_shared_productions()
  TO authenticated;

-- 3. Estadísticas de accesos compartidos, solo para administración.
--    No se ofrecen ni al dueño de la producción ni al invitado.
CREATE OR REPLACE FUNCTION public.admin_shared_production_activity(
  p_production_id uuid
)
RETURNS TABLE (
  user_id uuid,
  user_name text,
  user_email text,
  first_access_at timestamptz,
  last_viewed_at timestamptz,
  view_count bigint,
  last_clicked_at timestamptz,
  click_count bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.user_roles AS r
    WHERE r.user_id = auth.uid() AND r.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  RETURN QUERY
  SELECT
    a.user_id,
    pr.full_name::text,
    u.email::text,
    MIN(a.first_access_at),
    MAX(a.last_viewed_at),
    COALESCE(SUM(a.view_count), 0)::bigint,
    MAX(a.last_clicked_at),
    COALESCE(SUM(a.click_count), 0)::bigint
  FROM public.production_share_access AS a
  JOIN public.production_shares AS s ON s.token = a.token
  JOIN auth.users AS u ON u.id = a.user_id
  LEFT JOIN public.profiles AS pr ON pr.id = a.user_id
  WHERE s.production_id = p_production_id
  GROUP BY a.user_id, pr.full_name, u.email
  ORDER BY MAX(a.last_viewed_at) DESC NULLS LAST;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_shared_production_activity(uuid)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_shared_production_activity(uuid)
  TO authenticated;

NOTIFY pgrst, 'reload schema';
