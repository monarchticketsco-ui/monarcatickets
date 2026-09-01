-- Monarca Tickets — imagen de banner por evento (Fase de diseno).
-- Antes de esta migracion, la imagen del evento se elegia automaticamente
-- por categoria (ver lib/event-visuals.ts). Con esta columna el
-- organizador puede subir su propia foto; si la deja vacia, seguimos
-- usando la imagen curada por categoria como respaldo.

alter table events add column if not exists image_url text;
