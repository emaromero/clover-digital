-- ETAPA 1: ejecutar ANTES de desplegar el frontend nuevo.
-- Crea un RPC público limitado a datos de los enlaces, SIN actividad de colegas.
-- No revoca todavía la función vieja: la web actualmente publicada la utiliza.
-- Firma verificada: public.list_production_share_links(p_production_id uuid)
-- share_token uuid; fechas timestamptz.

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
    link.created_at,
    link.expires_at,
    link.revoked_at
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
