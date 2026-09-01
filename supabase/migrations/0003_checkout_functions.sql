-- Monarca Tickets — funciones de checkout (Fase 2)
-- Ver blueprint seccion 06 (control de aforo) y Fig. 3 (flujo de pago).

-- Reserva atomica de cupo: se llama al crear la orden (antes de mandar al
-- comprador a pagar con Bold), no cuando el pago se confirma. Asi nunca
-- generamos mas links de pago que cupo disponible. Es una sola sentencia
-- UPDATE con el chequeo en el WHERE, por lo que dos checkouts concurrentes
-- para el ultimo boleto no pueden pisarse (el segundo simplemente no
-- encuentra fila que actualizar y lanza 'sin_cupo').
create or replace function reservar_cupo(p_ticket_type_id uuid, p_cantidad integer)
returns void as $$
begin
  update ticket_types
     set sold_count = sold_count + p_cantidad
   where id = p_ticket_type_id
     and sold_count + p_cantidad <= capacity;

  if not found then
    raise exception 'sin_cupo' using errcode = 'P0001';
  end if;
end;
$$ language plpgsql security definer;

-- Libera cupo previamente reservado cuando la orden termina en 'fallida'
-- (pago rechazado/anulado en Bold). El barrido de ordenes 'pendiente'
-- vencidas (comprador que nunca completo el pago) queda como TODO de
-- Fase 2.1 — hoy solo se libera por webhook SALE_REJECTED/VOID_APPROVED.
create or replace function liberar_cupo(p_ticket_type_id uuid, p_cantidad integer)
returns void as $$
begin
  update ticket_types
     set sold_count = greatest(sold_count - p_cantidad, 0)
   where id = p_ticket_type_id;
end;
$$ language plpgsql security definer;

grant execute on function reservar_cupo(uuid, integer) to service_role;
grant execute on function liberar_cupo(uuid, integer) to service_role;
