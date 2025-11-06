// ===============================
//  js/site.js
//  Header y Footer reutilizables (carga dinámica),
//  ajuste dinámico de la altura del header fijo,
//  y sincronización del badge del carrito.
//  =============================== 
document.addEventListener("DOMContentLoaded", async () => {
	const placeholder = document.getElementById("header-placeholder");
	if (!placeholder) return;

	// Detectar ruta raíz del proyecto (ORIGINAL)
	const path = window.location.pathname;
	const rootMatch = path.match(/^(.*?)(categorias|pages|includes|js|css)\//);
	const projectRoot = rootMatch ? rootMatch[1] : path.replace(/[^/]*$/, "");

	const headerURL = projectRoot + "includes/header.html";

	try {
		// Cargar el fragmento de header (ORIGINAL)
		const res = await fetch(headerURL, { cache: "no-store" });
		if (!res.ok)
			throw new Error("No se pudo cargar el header desde " + headerURL);
		placeholder.innerHTML = await res.text();

		// === NUEVO: Sincronización del badge del carrito (debe ir después de insertar el header)
		(function setupCartBadge() {
			const badge = document.getElementById("cart-badge");
			if (!badge) return;

			// Valor inicial desde localStorage (funciona aunque Cart aún no haya inicializado)
			try {
				const raw = localStorage.getItem("cart");
				const items = raw ? JSON.parse(raw) : [];
				const initialCount = items.reduce((acc, it) => acc + (it.qty || 0), 0);
				badge.textContent = initialCount;
			} catch {
				badge.textContent = 0;
			}

			// Si el módulo Cart existe, usar su conteo y suscribirse a cambios
			const updateFromCart = () => {
				if (window.Cart && typeof Cart.count === "function") {
					badge.textContent = Cart.count();
				}
			};

			addEventListener("cart:updated", updateFromCart);
			updateFromCart();
		})();
		// === FIN NUEVO

		// Activar el botón ☰ (menú móvil) (ORIGINAL)
		const toggle = document.querySelector(".nav-toggle");
		const header = document.querySelector(".site-header");
		if (toggle && header) {
			toggle.addEventListener("click", () => {
				const abierto = header.classList.toggle("open");
				toggle.setAttribute("aria-expanded", abierto ? "true" : "false");
			});
		}

		// ===============================
		// Ajustar padding-top según alto real del header fijo (ORIGINAL)
		// ===============================
		const ajustarAlturaHeader = () => {
			const headerEl = document.querySelector(".site-header");
			if (headerEl) {
				const altura = headerEl.offsetHeight;
				document.documentElement.style.setProperty(
					"--altura-header",
					altura + "px"
				);
			}
		};

		// Ejecutar al cargar (ORIGINAL)
		ajustarAlturaHeader();

		// Volver a ajustar si cambia el tamaño de ventana o el menú se expande (ORIGINAL)
		window.addEventListener("resize", ajustarAlturaHeader);
		new MutationObserver(ajustarAlturaHeader).observe(document.body, {
			subtree: true,
			childList: true,
			attributes: true,
		});
	} catch (err) {
		console.error("Error cargando header reutilizable:", err);
	}
});

// ===============================
// Carga dinámica del FOOTER reutilizable (ORIGINAL)
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
	const placeholder = document.getElementById("footer-placeholder");
	if (!placeholder) return;
	const path = window.location.pathname;
	const rootMatch = path.match(/^(.*?)(categorias|pages|includes|js|css)\//);
	const projectRoot = rootMatch ? rootMatch[1] : path.replace(/[^/]*$/, "");
	const footerURL = projectRoot + "includes/footer.html";
	try {
		const res = await fetch(footerURL, { cache: "no-store" });
		if (!res.ok)
			throw new Error("No se pudo cargar el footer desde " + footerURL);
		placeholder.innerHTML = await res.text();
	} catch (err) {
		console.error("Error cargando footer reutilizable:", err);
	}
});
