# ONE HIT — Pedidos y Mercado Pago

## Configuración obligatoria en Cloudflare

1. Abre Workers & Pages → D1 SQL Database → Create database. Nombre sugerido: `onehit-orders`.
2. Abre la base, entra a Console y ejecuta el SQL de `migrations/0001_orders.sql`.
3. Abre Workers & Pages → welive1hit → Settings → Functions → D1 database bindings. Añade:
   - Variable name: `DB`
   - D1 database: `onehit-orders`
4. En Settings → Variables and Secrets, añade `MP_WEBHOOK_SECRET` como Secret. Pega la Firma secreta del entorno de prueba de Mercado Pago. Conserva `MP_ACCESS_TOKEN` como secret.
5. Guarda y espera el deployment de Pages.

## Webhook de prueba en Mercado Pago

En Tus integraciones → ONE HIT → Configuración de Webhooks:
- Selecciona **Prueba**.
- URL: `https://welive1hit.pages.dev/api/webhook`
- Evento: **Order (Mercado Pago)**.
- Guarda y copia la Firma secreta de prueba a Cloudflare como `MP_WEBHOOK_SECRET`.
- Usa Simular notificación para comprobar la entrega.

Cuando se habilite producción, configura la URL/evento en la pestaña Producción y usa la firma secreta correspondiente a ese entorno.

## Endpoints
- `POST /api/create-order`: guarda pedido pendiente y crea la orden.
- `POST /api/webhook`: valida firma, consulta la orden en Mercado Pago y actualiza el estado.
- `GET /api/order-status?reference=...`: devuelve estado y resumen público del pedido.

Un pedido solo pasa a `paid` cuando Mercado Pago confirma `status=processed` y `status_detail=accredited`.
