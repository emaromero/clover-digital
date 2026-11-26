-- IMPORTANTE: revisar la firma y las columnas de
-- public.list_production_share_links antes de ejecutar en Supabase.
-- Ejecutar ANTES de desplegar el frontend actualizado.
--
-- La función original contenía identidades, conteos y fechas de acceso,
-- datos que solo deben permanecer disponibles en el panel administrativo.

create or replace function public.list_production_share_links_safe(
  p_production_id uuid
)
returns table (
  share_token text,
  created_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz
)
language sql
security definer
set search_path = ''
as $$
  select distinct
    link.share_token::text,
    link.created_at::timestamptz,
    link.expires_at::timestamptz,
    link.revoked_at::timestamptz
  from public.list_production_share_links(p_production_id) as link
  where auth.uid() is not null
    and exists (
      select 1
      from public.productions as production
      where production.id = p_production_id
        and production.user_id = auth.uid()
    );
$$;

revoke all on function public.list_production_share_links_safe(uuid)
  from public, anon;
grant execute on function public.list_production_share_links_safe(uuid)
  to authenticated;

-- El RPC original exponía actividad individual de terceros.
-- Bloquear su invocación directa desde usuarios del portal.
-- Los administradores conservan sus métricas con admin_production_activity.
revoke execute on function public.list_production_share_links(uuid)
  from public, anon, authenticated;
