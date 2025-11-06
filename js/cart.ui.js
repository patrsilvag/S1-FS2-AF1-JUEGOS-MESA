/*
 * --------------------------------------------------------------
 * Módulo: cart.ui.js
 * --------------------------------------------------------------
 * Renderiza la tabla del carrito y el resumen de totales.
 * Escucha "cart:updated" emitido por cart.state.js.
 * Mejores prácticas añadidas:
 *  - data-label para móvil (tabla → tarjetas)
 *  - Habilitar/inhabilitar "Vaciar carrito" según estado
 *  - Saneo de cantidad (min 1) y prevención de scroll-wheel
 *  - Protección para no registrar eventos múltiples
 * --------------------------------------------------------------
 */

/* Formatea CLP sin decimales */
const formatoCLP = (valor) =>
	new Intl.NumberFormat("es-CL", {
		style: "currency",
		currency: "CLP",
		maximumFractionDigits: 0,
	}).format(valor);

/* Render principal de la página del carrito */
function renderCartPage() {
	const items = Cart.getItems();
	const tbody = document.getElementById("cart-items");
	const empty = document.getElementById("cart-empty");
	const summary = document.getElementById("cart-summary");
	const btnVaciar = document.getElementById("btn-vaciar");

	if (!tbody || !empty || !summary) return;

	tbody.innerHTML = "";

	if (items.length === 0) {
		empty.classList.remove("d-none");
		summary.classList.add("d-none");
		// Totales en cero y botón vaciar deshabilitado
		const $ = (id) => document.getElementById(id);
		$("#subtotal") && ($("#subtotal").textContent = formatoCLP(0));
		$("#envio") && ($("#envio").textContent = formatoCLP(0));
		$("#total") && ($("#total").textContent = formatoCLP(0));
		if (btnVaciar) btnVaciar.disabled = true;
		return;
	} else {
		empty.classList.add("d-none");
		summary.classList.remove("d-none");
		if (btnVaciar) btnVaciar.disabled = false;
	}

	// Construcción de filas
	for (const item of items) {
		const tr = document.createElement("tr");
		tr.dataset.id = item.id;
		tr.innerHTML = `
      <td data-label="Producto">
        <div class="cart-product">
          <img src="${item.img}" alt="${
			item.nombre
		}" class="cart-thumb" width="64" height="64" loading="lazy">
          <span class="fw-medium">${item.nombre}</span>
        </div>
      </td>
      <td data-label="Precio">${formatoCLP(item.precio)}</td>
      <td data-label="Cantidad">
        <input type="number" min="1" value="${
					item.qty
				}" class="form-control qty-input w-50 mx-auto">
      </td>
      <td data-label="Subtotal">${formatoCLP(item.precio * item.qty)}</td>
      <td data-label="Acciones">
        <button type="button" class="btn btn-sm btn-danger btn-eliminar">Eliminar</button>
      </td>
    `;
		tbody.appendChild(tr);
	}

	// Resumen (con regla simple de envío)
	const subtotal = Cart.total();
	const envio = subtotal >= 50000 ? 0 : 3990;
	const total = subtotal + envio;

	document.getElementById("subtotal").textContent = formatoCLP(subtotal);
	document.getElementById("envio").textContent = formatoCLP(envio);
	document.getElementById("total").textContent = formatoCLP(total);
}

/* Conecta los eventos de interacción (delegación) */
function setupCartEvents() {
	if (window.__CART_UI_WIRED__) return;
	window.__CART_UI_WIRED__ = true;

	const tbody = document.getElementById("cart-items");
	if (!tbody) return;

	// Cambios de cantidad (sanea y aplica mínimo 1)
	tbody.addEventListener("change", (e) => {
		if (!e.target.classList.contains("qty-input")) return;
		const input = e.target;
		const tr = input.closest("tr");
		if (!tr) return;

		let qty = parseInt(input.value, 10);
		if (!Number.isFinite(qty) || qty < 1) qty = 1;
		input.value = qty;
		Cart.setQty(tr.dataset.id, qty);
	});

	// Previene cambio accidental de cantidad con rueda del mouse
	tbody.addEventListener(
		"wheel",
		(e) => {
			if (e.target.classList.contains("qty-input")) {
				e.target.blur();
			}
		},
		{ passive: true }
	);

	// Eliminar ítem
	tbody.addEventListener("click", (e) => {
		if (!e.target.classList.contains("btn-eliminar")) return;
		const tr = e.target.closest("tr");
		if (!tr) return;
		Cart.remove(tr.dataset.id);
	});

	// Vaciar carrito
	const btnVaciar = document.getElementById("btn-vaciar");
	if (btnVaciar) {
		btnVaciar.addEventListener("click", () => {
			if (confirm("¿Desea vaciar el carrito?")) Cart.clear();
		});
	}

	// Re-render en cada actualización del estado
	addEventListener("cart:updated", renderCartPage);
}

/* Inicializa UI del carrito */
document.addEventListener("DOMContentLoaded", () => {
	setupCartEvents();
	renderCartPage();
});
