-- Monarca Tickets — banner ancho de la pagina publica del evento (distinto
-- de events.image_url, que es la portada/miniatura que se usa en las
-- tarjetas de /eventos) y etiqueta de etapa de venta por localidad (ej.
-- "Preventa", "Etapa 2") para poder mostrar varias ventanas de precio del
-- mismo tipo de boleto, como hacen otras boleteras. Las fechas de cada
-- etapa ya existian (ticket_types.sale_starts_at / sale_ends_at, ver
-- 0001_init.sql) pero no se exponian en los formularios; esta migracion
-- solo agrega el nombre de la etapa, todo opcional.

alter table events add column if not exists banner_url text;
alter table ticket_types add column if not exists etapa text;
