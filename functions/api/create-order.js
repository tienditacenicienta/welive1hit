const CATALOG = {
  "Polo gráfico 01 / Blanco": 49,
  "Polo básico / Negro": 45,
  "Polo gráfico 02 / Blanco": 49,
  "Polo gráfico 02 / Arena": 49,
  "Hoodie ONE HIT / Negro": 89,
  "PROV. 17:22": 49,
  "ONE MOMENT": 49,
  "NO FEAR": 49,
  "LIVE YOUR 1HIT": 49,
  "EVERYDAY 1HIT": 45,
  "OWN YOUR WAY": 49,
  "ONE LIFE": 49,
  "1HIT CLASSIC": 45
};

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });

export async function onRequestPost({ request, env }) {
  if (!env.MP_ACCESS_TOKEN) {
    return json({ error: "La pasarela de pago no está configurada." }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Solicitud inválida." }, 400);
  }

  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 30) {
    return json({ error: "La bolsa no contiene productos válidos." }, 400);
  }

  const items = [];
  let total = 0;

  for (const item of body.items) {
    const unitPrice = CATALOG[item?.name];
    const quantity = Number(item?.quantity);
    const validSize = ["S", "M", "L", "XL"].includes(item?.size);
    const validColor = ["Blanco", "Negro", "Gris", "Arena"].includes(item?.color);

    if (
      typeof item?.name !== "string" ||
      !unitPrice ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 20 ||
      !validSize ||
      !validColor
    ) {
      return json({ error: "Uno de los productos de la bolsa no es válido. Revisa talla, color y cantidad." }, 400);
    }

    total += unitPrice * quantity;
    items.push({
      title: item.name,
      description: `Color ${item.color} · Talla ${item.size}`,
      quantity,
      unit_price: unitPrice
    });
  }

  if (!Number.isFinite(total) || total <= 0 || total > 10000) {
    return json({ error: "El total del pedido no es válido." }, 400);
  }

  const origin = new URL(request.url).origin;
  const reference = `1HIT-${crypto.randomUUID()}`;
  const payload = {
    type: "online",
    processing_mode: "manual",
    capture_mode: "automatic_async",
    total_amount: total.toFixed(2),
    external_reference: reference,
    description: "Compra en ONE HIT",
    items,
    config: {
      online: {
        success_url: `${origin}/?mp_return=success`,
        failure_url: `${origin}/?mp_return=failure`,
        pending_url: `${origin}/?mp_return=pending`,
        auto_return: "approved"
      }
    }
  };

  let mpResponse;
  try {
    mpResponse = await fetch("https://api.mercadopago.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Idempotency-Key": crypto.randomUUID()
      },
      body: JSON.stringify(payload)
    });
  } catch {
    return json({ error: "No pudimos conectar con Mercado Pago. Inténtalo nuevamente." }, 502);
  }

  const result = await mpResponse.json().catch(() => ({}));
  if (!mpResponse.ok || !result.checkout_url) {
    console.error("Mercado Pago order error", mpResponse.status, result);
    return json({ error: "Mercado Pago no pudo crear el pago. Revisa tus datos e inténtalo nuevamente." }, 502);
  }

  return json({
    checkout_url: result.checkout_url,
    order_id: result.id,
    external_reference: reference
  });
}
