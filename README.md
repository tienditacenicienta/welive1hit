# ONE HIT — definitive headline fix

The previous headline rule was not reliably applying its absolute positioning. This patch explicitly sets the headline to `position:absolute` inside `#home.hero`, centers it at 50% of the hero height, and keeps it above the model.

No changes to product metadata, size selector, quantity selector, add-to-bag button, logo, images, carousel or cart logic.

Replace only:
- `index.html`
- `src/styles.css`

Keep `src/app.js` and `public/` unchanged. The stylesheet URL version was updated to bypass cached CSS.
