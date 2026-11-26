-- CLOVER DIGITAL / RESUMEN DE PAGOS PARA AGENTES
-- Ejecutar antes de publicar la nueva interfaz.
-- La función verifica auth.uid() y NO revela pagos de otras personas.
-- No modifica los pagos ni la información financiera existente.

CREATE OR REPLACE FUNCTION public.client_production_paid_totals(
  p_production_ids uuid[]
)
RETURNS TABLE (
  production_id uuid,
  paid_amount numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    production.id,
    COALESCE(SUM(payment.amount), 0)::numeric
  FROM public.productions AS production
  LEFT JOIN public.production_payments AS payment
    ON payment.production_id = production.id
  WHERE production.user_id = auth.uid()
    AND production.id = ANY(p_production_ids)
  GROUP BY production.id;
$$;

REVOKE ALL
ON FUNCTION public.client_production_paid_totals(uuid[])
FROM PUBLIC, anon;

GRANT EXECUTE
ON FUNCTION public.client_production_paid_totals(uuid[])
TO authenticated;
