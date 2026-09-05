-- Boletos nominativos: cada boleto individual debe quedar asociado a la
-- persona que va a usarlo (nombre + cedula), no solo a la cuenta que
-- compro. Se captura en el checkout (antes de pagar) y se copia a cada
-- fila de `tickets` cuando el pago se aprueba y se generan los boletos.

-- Datos de los asistentes capturados en el checkout, uno por unidad
-- comprada en ese item (jsonb: [{ "nombre": "...", "documento": "..." }]).
-- Se guarda aqui temporalmente porque los boletos individuales (tabla
-- tickets) todavia no existen en el momento del checkout -- se crean
-- recien cuando Bold confirma el pago.
alter table order_items add column asistentes jsonb;

-- Titular real de cada boleto (puede ser distinto a quien compro/paga).
alter table tickets add column holder_name text;
alter table tickets add column holder_document text;
