# API pública de Monarca Tickets (v1)

Documentación para integraciones de terceros — por ejemplo, un agente/bot que vende boletos, consulta eventos y radica PQRS por WhatsApp.

> Estado: primera versión funcional. Ver **Limitaciones actuales** al final antes de llevar algo a producción.

## Autenticación

Todas las rutas requieren un header:

```
x-api-key: <tu llave>
```

Cada llave tiene *scopes* (permisos) asignados. Si tu llave no tiene el scope que necesita un endpoint, la API responde `403`.

| Scope | Permite |
|---|---|
| `eventos:leer` | Listar y consultar eventos y disponibilidad de boletos |
| `ordenes:crear` | Crear una orden y generar el link de pago |
| `ordenes:leer` | Consultar el estado de una orden |
| `pqrs:crear` | Radicar una petición, queja, reclamo, sugerencia o solicitud de soporte |

La llave la genera Monarca Tickets desde su backend (no hay autoservicio todavía). Si necesitas una llave nueva o cambiar sus scopes, pide que la generen para ti.

Base URL: `https://monarcatickets-web.vercel.app`

## Errores

Todas las respuestas de error tienen la forma `{"error": "codigo"}`, a veces con un campo `detalle`. Códigos HTTP usados: `400` datos inválidos, `401` falta la llave o es inválida, `403` la llave no tiene el scope necesario, `404` no encontrado, `409` sin cupo disponible, `500`/`502` error del servidor o de la pasarela de pago.

---

## `GET /api/v1/eventos`

Lista eventos publicados y en venta.

**Query params (todos opcionales):**

- `q` — texto libre, busca en el nombre del evento.
- `ciudad` — coincidencia exacta (ej. `Bogotá`).
- `categoria` — una de: `Concierto`, `Festival`, `Teatro`, `Comedia`, `Deportivo`, `Conferencia`, `Familiar`.
- `fecha` — formato `YYYY-MM-DD`, eventos ese día.
- `limit` — máximo de resultados (default 50, máximo 100).

```bash
curl "https://monarcatickets-web.vercel.app/api/v1/eventos?ciudad=Bogot%C3%A1&categoria=Concierto" \
  -H "x-api-key: TU_API_KEY"
```

```json
{
  "eventos": [
    {
      "id": "uuid",
      "name": "Luces de Neón — Radiante en Concierto",
      "description": null,
      "venue": "Movistar Arena",
      "city": "Bogotá",
      "category": "Concierto",
      "starts_at": "2026-09-18T20:00:00-05:00",
      "status": "en_venta",
      "image_url": null
    }
  ]
}
```

## `GET /api/v1/eventos/:id`

Detalle de un evento con sus tipos de boleto y disponibilidad en tiempo real.

```bash
curl "https://monarcatickets-web.vercel.app/api/v1/eventos/<id>" \
  -H "x-api-key: TU_API_KEY"
```

```json
{
  "evento": { "id": "uuid", "name": "...", "venue": "...", "city": "...", "starts_at": "...", "status": "en_venta" },
  "tipos_de_boleto": [
    { "id": "uuid", "nombre": "General", "precio_cop": 180000, "disponibles": 2731 },
    { "id": "uuid", "nombre": "VIP", "precio_cop": 350000, "disponibles": 412 }
  ]
}
```

Usa `tipos_de_boleto[].id` como `ticket_type_id` al crear la orden.

## `POST /api/v1/ordenes`

Crea una orden y devuelve el link de pago de Bold. El comprador **no necesita cuenta previa en el sitio** — si el correo no existe, se le crea un perfil automáticamente (así podría, si quisiera, entrar luego a monarcatickets con ese correo). El aforo se reserva de forma atómica: si dos personas compran el último boleto al mismo tiempo, solo una gana la reserva.

**Boletos nominativos:** cada boleto va asociado a la persona que lo va a usar. Por eso `asistentes` es obligatorio y debe traer **exactamente un elemento por cada unidad de `cantidad`**, cada uno con `nombre` (mínimo 3 caracteres) y `documento` (cédula, solo números, 5 a 15 dígitos). Esto es aparte de `comprador`, que es quien paga — pueden ser la misma persona o no.

```bash
curl -X POST "https://monarcatickets-web.vercel.app/api/v1/ordenes" \
  -H "x-api-key: TU_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "ticket_type_id": "uuid-del-tipo-de-boleto",
    "cantidad": 2,
    "comprador": {
      "nombre": "Juan Pérez",
      "correo": "juan@correo.com",
      "telefono": "3001234567"
    },
    "asistentes": [
      { "nombre": "Juan Pérez", "documento": "1020304050" },
      { "nombre": "María Gómez", "documento": "1030405060" }
    ]
  }'
```

Errores propios de este campo: `400 asistentes_invalidos` (falta algún asistente, no coincide la cantidad, o un nombre/documento no es válido — viene `detalle` con el motivo exacto).

Respuesta (`200`):

```json
{
  "orden_id": "uuid",
  "estado": "pendiente",
  "total_cop": 360000,
  "checkout_url": "https://checkout.bold.co/..."
}
```

Manda `checkout_url` al comprador (por ejemplo, como link en WhatsApp). Cuando pague, Bold notifica a Monarca Tickets por su cuenta — no necesitas hacer nada más, pero puedes consultar el estado con el siguiente endpoint.

Errores específicos de este endpoint: `409 sin_cupo` (ya no hay disponibilidad), `502 error_creando_pago` (Bold rechazó la solicitud — vendrá `detalle` con el motivo).

## `GET /api/v1/ordenes/:id`

Consulta el estado de una orden (`pendiente`, `pagada`, `fallida`, `reembolsada`).

```bash
curl "https://monarcatickets-web.vercel.app/api/v1/ordenes/<orden_id>" \
  -H "x-api-key: TU_API_KEY"
```

```json
{
  "orden_id": "uuid",
  "estado": "pagada",
  "total_cop": 360000,
  "evento": "Luces de Neón — Radiante en Concierto",
  "creada_en": "2026-09-01T12:00:00.000Z"
}
```

## `POST /api/v1/pqrs`

Radica una petición, queja, reclamo, sugerencia o solicitud de soporte de compra.

```bash
curl -X POST "https://monarcatickets-web.vercel.app/api/v1/pqrs" \
  -H "x-api-key: TU_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "soporte_compra",
    "nombre": "Juan Pérez",
    "correo": "juan@correo.com",
    "telefono": "3001234567",
    "referencia_orden": "uuid-de-la-orden",
    "mensaje": "No me llegó el boleto al correo."
  }'
```

`tipo` debe ser uno de: `peticion`, `queja`, `reclamo`, `sugerencia`, `soporte_compra`. `documento`, `telefono` y `referencia_orden` son opcionales.

Respuesta (`201`): `{"pqrs_id": "uuid", "estado": "abierta"}`.

---

## Limitaciones actuales

- **Pagos**: hasta que Monarca Tickets configure sus llaves reales de Bold en producción, `POST /api/v1/ordenes` va a fallar con `502 error_creando_pago` al intentar generar el link de pago. La orden y la reserva de cupo sí se crean correctamente; solo falla el último paso.
- **Rate limiting**: cada llave tiene un `rate_limit_per_min` configurado en la base de datos, pero **todavía no se aplica automáticamente** en la API — es solo informativo por ahora.
- **Gestión de PQRS**: las solicitudes quedan guardadas en la base de datos (tabla `pqrs_solicitudes`), pero hoy nadie las revisa desde un panel — eso es trabajo pendiente del lado de Monarca Tickets.
- **Sin webhooks salientes**: si necesitas que Monarca Tickets te avise cuando una orden pasa a `pagada` (en vez de tener que consultar `GET /api/v1/ordenes/:id` tú mismo), eso no existe todavía — pídelo si lo necesitas.
