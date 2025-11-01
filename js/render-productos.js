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

  function cardHTML(p) {
    const precio = formatoCLP(p.precio);
    const badge = p.descuento
      ? `<span class="juego-descuento d-inline-block ms-2">Descuento</span>`
      : "";
    return `
      <div class="col">
        <div class="juego-ficha h-100" data-id="${p.id}" data-categoria="${
          p.categoria
        }">
          <img src="${p.img}" alt="${p.alt}" class="card-img-top" />
          <div class="card-body">
            <h5 class="juego-nombre">${p.nombre}</h5>
            <p class="juego-descripcion">${p.desc || ""}</p>
            <p class="juego-precio">Precio: ${precio} ${badge}</p>
            <button class="btn btn-primary btn-agregar" data-id="${
              p.id
            }" data-precio="${p.precio}">
              Agregar
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function renderListaProductos(root) {
    if (!window.PRODUCTOS) return;
    const categoria = root.dataset.categoria || ""; // p.ej. "amigos"
    const productos = categoria
      ? window.PRODUCTOS.filter((p) => p.categoria === categoria)
      : window.PRODUCTOS.slice();

    root.innerHTML = `
      <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
        ${productos.map(cardHTML).join("")}
      </div>
    `;

    // (Hook futuro para carrito)
    root.querySelectorAll(".btn-agregar").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        // Aquí luego sumaremos al carrito; por ahora, confirmamos que funciona:
        console.log("Agregar al carrito:", id);
        btn.blur();
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-lista-productos]");
    if (!root) return;
    renderListaProductos(root);
  });
})();
