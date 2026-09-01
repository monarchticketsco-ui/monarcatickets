-- Monarca Tickets — esquema inicial
-- Ver blueprint (Fig. 2, seccion 02) para el diagrama de este modelo.

create extension if not exists "pgcrypto";

create type user_role as enum ('comprador', 'organizador', 'staff_puerta', 'admin');
create type event_status as enum ('borrador', 'publicado', 'en_venta', 'finalizado', 'cancelado');
create type order_status as enum ('pendiente', 'pagada', 'fallida', 'reembolsada');
create type ticket_status as enum ('valido', 'usado', 'cancelado', 'transferido');
create type invoice_status as enum ('pendiente', 'emitida', 'fallida');
create type payout_status as enum ('pendiente', 'pagado');
create type dian_status as enum ('no_habilitado', 'en_proceso', 'habilitado');

-- ---------------------------------------------------------------------
-- profiles: extiende auth.users con el rol de negocio
-- ---------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'comprador',
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- organizers
-- ---------------------------------------------------------------------
create table organizers (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references profiles(id),
  legal_name text not null,
  nit text not null unique,
  dian_status dian_status not null default 'no_habilitado',
  commission_rate numeric(5,2) not null default 10.00, -- % que cobra la plataforma
  bank_account jsonb, -- {banco, tipo_cuenta, numero} — usado en el payout manual (fase 1)
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- events
-- ---------------------------------------------------------------------
create table events (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references organizers(id) on delete cascade,
  name text not null,
  description text,
  venue text not null,
  city text not null,
  category text,
  starts_at timestamptz not null,
  status event_status not null default 'borrador',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- ticket_types — aqui vive el aforo (capacity/sold_count), no hay tabla de asientos
-- ---------------------------------------------------------------------
create table ticket_types (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  name text not null, -- "General", "VIP", "Palco"...
  price_cop integer not null check (price_cop >= 0),
  capacity integer not null check (capacity > 0),
  sold_count integer not null default 0 check (sold_count >= 0),
  sale_starts_at timestamptz,
  sale_ends_at timestamptz,
  constraint sold_within_capacity check (sold_count <= capacity)
);

-- ---------------------------------------------------------------------
-- orders / order_items
-- ---------------------------------------------------------------------
create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  event_id uuid not null references events(id),
  status order_status not null default 'pendiente',
  total_cop integer not null default 0,
  bold_payment_id text unique, -- clave de idempotencia: 1 pago Bold = 1 orden pagada
  created_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  ticket_type_id uuid not null references ticket_types(id),
  quantity integer not null check (quantity > 0),
  unit_price_cop integer not null -- precio congelado al momento de la compra
);

-- ---------------------------------------------------------------------
-- tickets — un registro por boleto individual, QR firmado
-- ---------------------------------------------------------------------
create table tickets (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null references order_items(id) on delete cascade,
  qr_signed text not null unique,
  status ticket_status not null default 'valido',
  holder_user_id uuid not null references profiles(id),
  used_at timestamptz,
  scanned_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- invoices — factura DIAN asociada a la orden (ver blueprint seccion 05)
-- ---------------------------------------------------------------------
create table invoices (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id),
  organizer_id uuid not null references organizers(id),
  status invoice_status not null default 'pendiente',
  cufe text,
  xml_url text,
  pdf_url text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- payout_ledger — reemplaza el split payment que Bold no ofrece (seccion 04)
-- ---------------------------------------------------------------------
create table payout_ledger (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references organizers(id),
  event_id uuid not null references events(id),
  gross_cop integer not null,
  commission_cop integer not null,
  net_cop integer not null,
  status payout_status not null default 'pendiente',
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- api_clients / scan_logs
-- ---------------------------------------------------------------------
create table api_clients (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  api_key_hash text not null unique,
  scopes text[] not null default '{}',
  rate_limit_per_min integer not null default 60,
  created_at timestamptz not null default now()
);

create table scan_logs (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references tickets(id),
  device_id text,
  result text not null, -- 'ok' | 'ya_usado' | 'invalido'
  scanned_at timestamptz not null default now()
);

-- =======================================================================
-- Row Level Security — ver blueprint seccion 07 para la matriz por rol.
-- Las escrituras de negocio (crear orden, confirmar pago, emitir factura,
-- correr payout) las hace el backend con la service role key, que se
-- salta RLS por diseño. Estas politicas son la defensa para el acceso
-- directo desde el cliente (frontend) via la anon key.
-- =======================================================================

alter table profiles enable row level security;
alter table organizers enable row level security;
alter table events enable row level security;
alter table ticket_types enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table tickets enable row level security;
alter table invoices enable row level security;
alter table payout_ledger enable row level security;
alter table api_clients enable row level security;
alter table scan_logs enable row level security;

create function is_admin() returns boolean as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$ language sql security definer stable;

-- profiles: cada quien ve y edita su propia fila; admin ve todas
create policy "profiles_select_own_or_admin" on profiles for select
  using (id = auth.uid() or is_admin());
create policy "profiles_update_own" on profiles for update
  using (id = auth.uid());

-- organizers: el dueno ve/edita su organizador; el resto solo si es admin
create policy "organizers_select_own_or_admin" on organizers for select
  using (owner_user_id = auth.uid() or is_admin());
create policy "organizers_update_own" on organizers for update
  using (owner_user_id = auth.uid());

-- events: publico ve eventos publicados/en venta; el organizador ve y
-- edita los suyos en cualquier estado
create policy "events_select_public_or_owner" on events for select
  using (
    status in ('publicado', 'en_venta', 'finalizado')
    or organizer_id in (select id from organizers where owner_user_id = auth.uid())
    or is_admin()
  );
create policy "events_write_owner" on events for insert
  with check (organizer_id in (select id from organizers where owner_user_id = auth.uid()));
create policy "events_update_owner" on events for update
  using (organizer_id in (select id from organizers where owner_user_id = auth.uid()) or is_admin());

-- ticket_types: visibles si el evento padre es visible
create policy "ticket_types_select_public_or_owner" on ticket_types for select
  using (
    event_id in (select id from events where status in ('publicado','en_venta','finalizado'))
    or event_id in (
      select e.id from events e
      join organizers o on o.id = e.organizer_id
      where o.owner_user_id = auth.uid()
    )
    or is_admin()
  );

-- orders: el comprador ve solo sus propias ordenes; el organizador ve las
-- de sus eventos (para reportes); nadie inserta directo (lo hace el backend)
create policy "orders_select_own" on orders for select
  using (
    user_id = auth.uid()
    or event_id in (
      select e.id from events e
      join organizers o on o.id = e.organizer_id
      where o.owner_user_id = auth.uid()
    )
    or is_admin()
  );

-- tickets: el titular ve sus boletos; staff_puerta/admin pueden marcarlos
-- usados (la logica fina de "solo eventos asignados" se agrega en fase 5)
create policy "tickets_select_own_or_staff" on tickets for select
  using (
    holder_user_id = auth.uid()
    or exists (select 1 from profiles where id = auth.uid() and role in ('staff_puerta','admin'))
  );
create policy "tickets_update_staff" on tickets for update
  using (exists (select 1 from profiles where id = auth.uid() and role in ('staff_puerta','admin')));

-- invoices: visibles para el comprador de la orden y el organizador dueno
create policy "invoices_select_own" on invoices for select
  using (
    order_id in (select id from orders where user_id = auth.uid())
    or organizer_id in (select id from organizers where owner_user_id = auth.uid())
    or is_admin()
  );

-- payout_ledger: solo el organizador dueno ve su propio saldo
create policy "payout_ledger_select_own" on payout_ledger for select
  using (organizer_id in (select id from organizers where owner_user_id = auth.uid()) or is_admin());

-- api_clients / scan_logs: solo admin (gestion via service role)
create policy "api_clients_admin_only" on api_clients for select using (is_admin());
create policy "scan_logs_admin_or_staff" on scan_logs for select
  using (exists (select 1 from profiles where id = auth.uid() and role in ('staff_puerta','admin')));
