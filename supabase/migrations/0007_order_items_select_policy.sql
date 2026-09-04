-- La tabla order_items tiene RLS activado (0001_init.sql) pero nunca tuvo una
-- politica de SELECT. Postgres deniega todo acceso por defecto cuando RLS esta
-- activo y no hay politica para la operacion, asi que ningun comprador podia
-- ver sus propios items de orden (ni los boletos anidados) desde /mi-cuenta.
-- Esto solo se veia con el cliente admin/service-role, que ignora RLS.

create policy "order_items_select_via_order" on order_items for select
  using (
    exists (
      select 1 from orders o
      where o.id = order_items.order_id
        and (
          o.user_id = auth.uid()
          or o.event_id in (
            select e.id from events e
            join organizers org on org.id = e.organizer_id
            where org.owner_user_id = auth.uid()
          )
          or is_admin()
        )
    )
  );
