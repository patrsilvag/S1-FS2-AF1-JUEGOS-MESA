// js/render-productos.js
(function () {
	function formatoCLP(n) {
		try {
			return n.toLocaleString("es-CL", {
				style: "currency",
				currency: "CLP",
				maximumFractionDigits: 0,
			});
		} catch {
			return `$${(n || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
		}
	}

	// Cada tarjeta ya viene envuelta en la columna para cumplir:
	// xs: 12/12 (1 por fila), md: 4/12 (3 por fila), lg: 3/12 (4 por fila)
	function cardHTML(p) {
		const precio = formatoCLP(p.precio);
		const badge = p.descuento
			? `<span class="badge text-bg-warning ms-2">Descuento</span>`
			: "";

		const alt = p.alt || p.nombre || "Juego de mesa";

		return `
      <div class="col-12 col-md-4 col-lg-3">
        <div class="card h-100 shadow-sm juego-ficha" data-id="${
					p.id
				}" data-categoria="${p.categoria}">
          <img src="${
						p.img
					}" alt="${alt}" class="card-img-top" loading="lazy" />
          <div class="card-body d-flex flex-column">
            <h5 class="card-title juego-nombre mb-1">${p.nombre}</h5>
            <p class="card-text small text-muted juego-descripcion mb-2">${
							p.desc || ""
						}</p>
            <p class="juego-precio mb-3">Precio: <strong>${precio}</strong> ${badge}</p>
            <div class="mt-auto">
              <!-- type="button" evita submits accidentales -->
              <button type="button" class="btn btn-primary btn-agregar" data-id="${
								p.id
							}" data-precio="${p.precio}">
                Agregar
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
	}

	function renderListaProductos(root) {
		if (!window.PRODUCTOS) return;

		// Asegura que el contenedor tenga las clases de fila y gap (por si falta en algún HTML)
		// 💡 Aplica las clases Bootstrap al contenedor de productos
		root.classList.add("row", "g-4", "justify-content-center");

		const categoria = root.dataset.categoria || "";
		const productos = categoria
			? window.PRODUCTOS.filter((p) => p.categoria === categoria)
			: window.PRODUCTOS.slice();

		// Inyecta SOLO columnas (no otra .row)
		root.innerHTML = productos.map(cardHTML).join("");

		// Listeners directos (se mantienen)
		root.querySelectorAll(".btn-agregar").forEach((btn) => {
			btn.addEventListener("click", () => {
				const id = btn.dataset.id;

				// Log original
				console.log("Agregar al carrito:", id);

				// Integración con el carrito (si Cart está disponible)
				try {
					if (window.Cart && typeof Cart.add === "function") {
						Cart.add(id, 1); // suma 1 unidad del producto
					}
				} catch (e) {
					console.warn("No fue posible agregar al carrito en este momento:", e);
				}

				btn.blur();
			});
		});
	}

	document.addEventListener("DOMContentLoaded", () => {
		// Soporta múltiples listas en la misma página
		const roots = document.querySelectorAll("[data-lista-productos]");
		if (!roots.length) return;
		roots.forEach(renderListaProductos);
	});
})();
