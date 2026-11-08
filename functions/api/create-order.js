const CATALOG = {
  "Polo gráfico 01 / Blanco": 49, "Polo básico / Negro": 45, "Polo gráfico 02 / Blanco": 49,
  "Polo gráfico 02 / Arena": 49, "Hoodie ONE HIT / Negro": 89, "PROV. 17:22": 49,
  "ONE MOMENT": 49, "NO FEAR": 49, "LIVE YOUR 1HIT": 49, "EVERYDAY 1HIT": 45,
  "OWN YOUR WAY": 49, "ONE LIFE": 49, "1HIT CLASSIC": 45
};
const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
});
export async function onRequestPost({ request, env }) {
  if (!env.MP_ACCESS_TOKEN) return json({ error: "La pasarela de pago no está configurada." }, 503);
  if (!env.DB) return json({ error: "La base de datos de pedidos aún no está conectada en Cloudflare." }, 503);
  let body;
  try { body = await request.json(); } catch { return json({ error: "Solicitud inválida." }, 400); }
  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 30) return json({ error: "La bolsa no contiene productos válidos." }, 400);
  const phone = String(body.phone || "").replace(/\D/g, "");
  if (!/^9\d{8}$/.test(phone)) return json({ error: "Ingresa un celular peruano válido de 9 dígitos." }, 400);
  const shipping = { delivery: { label: "Delivery (Sólo Lima)", cost: 20 }, shalom: { label: "Shalom (Lima y Provincia)", cost: 12 } }[body.shipping_method];
  if (!shipping) return json({ error: "Selecciona un método de envío válido." }, 400);
  const items = [];
  let total = 0;
  for (const item of body.items) {
    const unitPrice = CATALOG[item?.name], quantity = Number(item?.quantity);
    const validSize = ["S", "M", "L", "XL"].includes(item?.size);
    const validColor = ["Blanco", "Negro", "Gris", "Arena"].includes(item?.color);
    if (typeof item?.name !== "string" || !unitPrice || !Number.isInteger(quantity) || quantity < 1 || quantity > 20 || !validSize || !validColor) {
      return json({ error: "Uno de los productos de la bolsa no es válido. Revisa talla, color y cantidad." }, 400);
    }
    total += unitPrice * quantity;
    items.push({ name: item.name, color: item.color, size: item.size, quantity, unit_price: unitPrice,
      title: item.name, description: `Color ${item.color} · Talla ${item.size}` });
  }
  const productsTotal = total;\n  total += shipping.cost;\n  if (!Number.isFinite(total) || total <= 0 || total > 10000) return json({ error: "El total del pedido no es válido." }, 400);\n  const orderItems = [...items, { name: shipping.label, color: "—", size: "—", quantity: 1, unit_price: shipping.cost, is_shipping: true }, { _meta: { shipping_label: shipping.label, shipping_cost: shipping.cost, products_total: productsTotal, phone } }];
  const origin = new URL(request.url).origin;
  const reference = `1HIT-${crypto.randomUUID()}`;
  try {
    await env.DB.prepare("INSERT INTO orders (id, external_reference, status, amount, currency, items) VALUES (?, ?, 'pending', ?, 'PEN', ?)")
      .bind(reference, reference, total, JSON.stringify(orderItems)).run();
  } catch (error) {
    console.error("Could not save pending ONE HIT order", error);
    return json({ error: "No pudimos guardar tu pedido. Inténtalo nuevamente." }, 503);
  }
  const payload = {
    type: "online", processing_mode: "manual", capture_mode: "automatic_async",
    total_amount: total.toFixed(2), external_reference: reference, description: "Compra en ONE HIT",
    items: [...items.map(({ title, description, quantity, unit_price }) => ({ title, description, quantity, unit_price: unit_price.toFixed(2) })), { title: `Envío — ${shipping.label}`, description: "Envío de 1 a 2 días", quantity: 1, unit_price: shipping.cost.toFixed(2) }],
    config: { online: {
      success_url: `${origin}/?mp_return=success&reference=${encodeURIComponent(reference)}`,
      failure_url: `${origin}/?mp_return=failure&reference=${encodeURIComponent(reference)}`,
      pending_url: `${origin}/?mp_return=pending&reference=${encodeURIComponent(reference)}`,
      auto_return: "approved"
    }}
  };
  let mpResponse;
  try {
    mpResponse = await fetch("https://api.mercadopago.com/v1/orders", {
      method: "POST",
      headers: { "Authorization": `Bearer ${env.MP_ACCESS_TOKEN}`, "Content-Type": "application/json", "Accept": "application/json", "X-Idempotency-Key": crypto.randomUUID() },
      body: JSON.stringify(payload)
    });
  } catch {
    await env.DB.prepare("UPDATE orders SET status='error', updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(reference).run();
    return json({ error: "No pudimos conectar con Mercado Pago. Inténtalo nuevamente." }, 502);
  }
  const result = await mpResponse.json().catch(() => ({}));
  if (!mpResponse.ok || !result.checkout_url || !result.id) {
    await env.DB.prepare("UPDATE orders SET status='error', updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(reference).run();
    console.error("Mercado Pago order error", mpResponse.status, { message: result.message, error: result.error, cause: result.cause, details: result.details });
    const providerMessage = [result.message, result.cause?.map?.(entry => entry.description || entry.code).filter(Boolean).join("; "),
      result.details?.map?.(entry => entry.description || entry.message || entry.code).filter(Boolean).join("; ")].filter(Boolean).join(" — ");
    return json({ error: providerMessage ? `Mercado Pago (${mpResponse.status}): ${providerMessage}` : `Mercado Pago no pudo crear el pago (HTTP ${mpResponse.status}). Revisa las credenciales y vuelve a intentarlo.` }, 502);
  }
  await env.DB.prepare("UPDATE orders SET updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(reference).run();
  return json({ checkout_url: result.checkout_url, order_id: result.id, external_reference: reference });
}
