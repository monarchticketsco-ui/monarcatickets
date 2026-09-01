-- Fase 1: crear el perfil automaticamente al registrarse, y agregar las
-- politicas de escritura que faltaban para que el organizador pueda
-- gestionar sus propios eventos y tipos de boleto desde el panel.

-- ---------------------------------------------------------------------
-- Trigger: cada auth.users nuevo obtiene una fila en profiles. El rol
-- inicial viene de raw_user_meta_data (seteado en el signUp del cliente);
-- si no viene, por defecto es 'comprador'.
-- ---------------------------------------------------------------------
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, full_name, phone)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'comprador'),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- organizers: el usuario puede crear su propia fila de organizador
-- (paso "completar perfil de organizador" despues del primer login)
-- ---------------------------------------------------------------------
create policy "organizers_insert_own" on organizers for insert
  with check (owner_user_id = auth.uid());

-- ---------------------------------------------------------------------
-- ticket_types: el organizador dueno del evento puede crear y editar
-- sus propios tipos de boleto. sold_count solo lo debe tocar el backend
-- (service role) al confirmar un pago — no hay policy de update para
-- ese campo especificamente en v1, se documenta como pendiente de
-- endurecer con un trigger que bloquee cambios directos a sold_count.
-- ---------------------------------------------------------------------
create policy "ticket_types_insert_owner" on ticket_types for insert
  with check (
    event_id in (
      select e.id from events e
      join organizers o on o.id = e.organizer_id
      where o.owner_user_id = auth.uid()
    )
  );

create policy "ticket_types_update_owner" on ticket_types for update
  using (
    event_id in (
      select e.id from events e
      join organizers o on o.id = e.organizer_id
      where o.owner_user_id = auth.uid()
    )
  );
