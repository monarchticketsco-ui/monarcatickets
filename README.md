# Monarca Tickets

Plataforma de venta de boletos para eventos — Colombia, pagos con Bold,
venta por aforo (sin mapa de asientos).

Documentos de referencia:
- Blueprint tecnico (arquitectura, modelo de datos, plan por fases):
  https://claude.ai/code/artifact/307e0edb-6dd6-42d0-ad05-8364c1d5aedf
- `Informe_Viabilidad_Ticketera.docx` (en esta misma carpeta)

## Estructura

```
apps/web/        Next.js — sitio publico, perfil de cliente, panel de
                  organizador y CRM admin, todo en la misma app por rol de ruta
apps/scanner/     App de validacion en puerta (Fase 5, aun no construida)
packages/shared/  Tipos TypeScript compartidos, reflejan supabase/migrations
supabase/
  migrations/     Esquema SQL + politicas RLS (0001_init.sql)
  functions/      Edge Functions (facturacion, generacion de QR, cron) — Fase 2+
```

## Fase 0 — antes de instalar y correr esto en serio

- [ ] Cuenta Bold activada + acceso a sandbox + esquema de webhooks confirmado con su soporte
- [ ] Escribirle a Bold para preguntar por un programa de marketplace/pagos a terceros no publicado (ver blueprint seccion 04)
- [ ] Cuenta Factus o Alegra activada en modo pruebas
- [ ] Confirmar con el contador quien factura al comprador final (organizador vs. plataforma)
- [x] Proyecto Supabase creado y esquema aplicado (`supabase db push`) — verificado con una consulta real
- [ ] Proyecto Vercel creado y enlazado a este repo

## Instalacion local

```bash
npm install
cp .env.example .env.local   # llenar con las llaves reales
npm run dev
```

## Aplicar el esquema a Supabase

```bash
npx supabase login
npx supabase link --project-ref <tu-project-ref>
npx supabase db push
```
