# ONE HIT — corrección de recursos e identidad

## Correcciones
- El logotipo grande 1HIT ahora es el PNG proporcionado, con fondo transparente; ya no se compone con texto HTML ni una estrella SVG aproximada.
- Se corrigieron las rutas de las cinco fotografías de modelos y de las miniaturas del catálogo: se sirven desde `/public/models/`.
- Se incluyó el PNG del logotipo en `public/brand/onehit-logo.png`.

## Subida a GitHub / Cloudflare Pages
1. Descomprime el ZIP.
2. Sube el contenido completo a la raíz del repositorio `welive1hit`, reemplazando archivos anteriores.
3. Confirma el commit y espera el despliegue de Cloudflare Pages.
4. Haz una recarga forzada del navegador si conserva recursos antiguos.

Configuración de Pages: preset None, comando de build vacío y directorio de salida `/` (raíz del repositorio).

## Nota
El carrito continúa siendo una demostración local; Mercado Pago, registro de pedidos e inventario aún no están conectados.
