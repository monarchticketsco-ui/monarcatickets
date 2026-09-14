-- Monarca Tickets — Ticket Service: el % que antes se documentaba como
-- "comision de la plataforma" (organizers.commission_rate) ahora se suma
-- al precio del boleto al momento de pagar, en vez de descontarse de lo
-- que recibe el organizador. Comprador y organizador comparten un solo
-- cargo a Bold (precio + Ticket Service), asi que necesitamos guardar
-- cuanto de cada orden pagada es Ticket Service para poder separar el
-- ingreso real del organizador del cargo que retiene Monarca.
alter table orders
  add column if not exists ticket_service_cop integer not null default 0;

comment on column orders.total_cop is
  'Total cobrado al comprador via Bold: precio del(los) boleto(s) + ticket_service_cop.';
comment on column orders.ticket_service_cop is
  'Porcion de total_cop que es el cargo de Ticket Service (organizers.commission_rate), retenida por Monarca Tickets. El resto (total_cop - ticket_service_cop) es el ingreso del organizador.';
