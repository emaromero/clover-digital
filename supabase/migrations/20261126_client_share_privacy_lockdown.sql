-- ETAPA 2: ejecutar SOLO DESPUÉS de desplegar la versión que utiliza
-- public.list_production_share_links_safe(uuid) y verificar que el titular
-- todavía puede generar, copiar, consultar y revocar sus enlaces.
--
-- La función original devuelve la identidad y actividad de visitantes;
-- debe dejar de estar disponible para usuarios autenticados del portal.
-- El seguimiento administrativo usa admin_production_activity.

revoke execute on function public.list_production_share_links(uuid)
  from public, anon, authenticated;
