// ===============================
//  js/site.js
//  Header y Footer reutilizables (carga dinámica),
//  ajuste dinámico de la altura del header fijo,
//  sincronización del badge del carrito,
//  y control de autenticación en el header.
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

		// === Control de autenticación (login / user / logout / profile / admin) ===
		(async function setupAuthNav() {
			try {
				const authModuleURL = projectRoot + "js/auth.repo.js"; // ruta absoluta desde la página actual
				const {
					getCurrentUser,
					setCurrentUser,
					refreshCurrentUser,
					ensureAdminSeed,
					can,
				} = await import(authModuleURL);

				// 🧱 Crear admin por defecto si no hay usuarios
				await ensureAdminSeed();

				// Leer usuario y sincronizar con storage por si hubo cambios
				let user = getCurrentUser();
				user = refreshCurrentUser() || user;

				const navLogin = document.getElementById("nav-login");
				const navLogout = document.getElementById("nav-logout");
				const navUser = document.getElementById("nav-user");
				const navProfile = document.getElementById("nav-profile");
				const navAdmin = document.getElementById("nav-admin");
				const navCart = document.getElementById("btn-cart"); // 🛒 id real del botón en el header

				const show = (el) => el && el.classList.remove("d-none");
				const hide = (el) => el && el.classList.add("d-none");

				const isActive = !!(user && user.status === "active");

				if (isActive) {
					if (navUser) {
						navUser.textContent = `👋 Hola, ${
							user.nombreUsuario || user.email
						}`;
						show(navUser);
					}
					hide(navLogin);
					show(navLogout);
					show(navProfile); // mostrar Perfil cuando hay sesión

					// Mostrar enlace Admin solo si el usuario tiene permiso
					if (navAdmin) {
						if (can(user, "user:list")) show(navAdmin);
						else hide(navAdmin);
					}
				} else {
					if (navUser) {
						navUser.textContent = "";
						hide(navUser);
					}
					show(navLogin);
					hide(navLogout);
					hide(navProfile);
					if (navAdmin) hide(navAdmin);
				}

				// Logout
				navLogout?.addEventListener("click", (e) => {
					e.preventDefault();
					setCurrentUser(null);
					window.location.href = projectRoot + "login.html";
				});

				// 🛒 Protección al presionar "Carrito"
				if (navCart) {
					navCart.addEventListener("click", (e) => {
						const user = getCurrentUser();
						if (!user) {
							e.preventDefault();
							alert("Debes iniciar sesión para acceder al carrito.");
							window.location.href = projectRoot + "login.html";
						} else if (user.status && user.status !== "active") {
							e.preventDefault();
							alert("Tu cuenta está deshabilitada. Contacta al administrador.");
							window.location.href = projectRoot + "login.html";
						}
					});
				}

				// Helpers globales para proteger páginas
				window.ensureAuth = function ensureAuth() {
					const u = getCurrentUser();
					const ok = !!(u && u.status === "active");
					if (!ok) window.location.href = projectRoot + "login.html";
				};

				window.ensureAdmin = function ensureAdmin() {
					const u = getCurrentUser();
					const ok = !!(u && u.status === "active" && can(u, "user:list"));
					if (!ok) window.location.href = projectRoot + "login.html";
				};
			} catch (e) {
				console.warn("No se pudo inicializar la navegación de auth:", e);
			}
		})();
		// === FIN Control de autenticación ===

		// === Sincronización del badge del carrito (tu lógica original) ===
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
		// === FIN badge ===

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
					"--estructura-altura-header",
					altura + "px"
				);
				document.documentElement.style.setProperty(
					"--altura-header",
					altura + "px"
				); // compat con tu CSS previo
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
