# ONE HIT — selector de talla y cantidad

Actualización de la portada:
- Elimina el popup `prompt()` para elegir talla.
- Muestra tallas S, M, L y XL encima del botón.
- Añade control de cantidad − / +.
- El botón AÑADIR A LA BOLSA agrega el producto, talla y cantidad al carrito.
- Si no se selecciona talla, muestra un aviso discreto en la misma zona, sin popup.
- El contador de la bolsa suma unidades y el subtotal calcula precio × cantidad.
- Si se añade nuevamente el mismo producto y talla, acumula la cantidad.

## Publicar
Reemplaza el contenido del repositorio por los archivos de este paquete o, si prefieres, reemplaza `index.html`, `src/app.js` y `src/styles.css` y conserva la carpeta `public`.
Cloudflare Pages debe desplegar automáticamente.

## Nota
El carrito sigue siendo demostrativo/local. Mercado Pago, persistencia de pedidos e inventario todavía no están conectados.
