// ===============================
// js/site.js
// ===============================

// -------------------------------------------------------------------
// Filtro global para inputs marcados con data-only-digits
// - Aplica en CAPTURA para máxima prioridad.
// - Soporta tecleo, pegado y arrastrar/soltar.
// -------------------------------------------------------------------
(function attachOnlyDigitsFilter() {
	const isControlKey = (k) =>
		k === "Backspace" ||
		k === "Delete" ||
		k === "ArrowLeft" ||
		k === "ArrowRight" ||
		k === "Tab" ||
		k === "Home" ||
		k === "End";

	// A) keydown: bloquea caracteres no numéricos y exceso de longitud
	document.addEventListener(
		"keydown",
		(e) => {
			const el = e.target;
			if (!el || !el.matches?.("input[data-only-digits]")) return;

			if (e.ctrlKey || e.metaKey || e.altKey || isControlKey(e.key)) return;

			const isDigit = /^\d$/.test(e.key);
			if (!isDigit) {
				e.preventDefault();
				return;
			}

			const max = parseInt(el.dataset.onlyDigits, 10) || 6;
			const selection = (el.selectionEnd ?? 0) - (el.selectionStart ?? 0);
			if (selection === 0 && (el.value?.length ?? 0) >= max) {
				e.preventDefault();
			}
		},
		true
	);

	// B) input: limpia siempre que se modifique el valor
	document.addEventListener(
		"input",
		(e) => {
			const el = e.target;
			if (!el || !el.matches?.("input[data-only-digits]")) return;

			const max = parseInt(el.dataset.onlyDigits, 10) || 6;
			const s = (el.value || "").replace(/\D/g, "").slice(0, max);
			if (el.value !== s) el.value = s;
		},
		true
	);

	// C) paste: inserta solo dígitos y respeta la posición del cursor
	document.addEventListener(
		"paste",
		(e) => {
			const el = e.target;
			if (!el || !el.matches?.("input[data-only-digits]")) return;

			e.preventDefault();
			const raw =
				(e.clipboardData || window.clipboardData)?.getData("text") || "";
			const max = parseInt(el.dataset.onlyDigits, 10) || 6;
			const digits = raw.replace(/\D/g, "").slice(0, max);

			const start = el.selectionStart ?? el.value.length;
			const end = el.selectionEnd ?? el.value.length;
			el.setRangeText(digits, start, end, "end");
			el.dispatchEvent(new Event("input", { bubbles: true }));
		},
		true
	);

	// D) drop: evita arrastrar/soltar texto
	document.addEventListener(
		"drop",
		(e) => {
			const el = e.target;
			if (el && el.matches?.("input[data-only-digits]")) e.preventDefault();
		},
		true
	);
})();

// ===============================
// Carga dinámica del HEADER reutilizable
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
	const placeholder = document.getElementById("header-placeholder");
	if (!placeholder) return;

	// Detecta la raíz del proyecto desde la ruta actual.
	const path = window.location.pathname;
	const rootMatch = path.match(/^(.*?)(categorias|pages|includes|js|css)\//);
	const projectRoot = rootMatch ? rootMatch[1] : path.replace(/[^/]*$/, "");
	const headerURL = projectRoot + "includes/header.html";

	// Notificaciones amigables de UI (expuestas globalmente).
	function notify(msg, type = "info", ms = 3000) {
		const box = document.getElementById("form-alert");
		if (box) {
			box.className = "alert alert-" + type;
			box.textContent = String(msg || "");
			box.classList.remove("d-none");
			if (ms) setTimeout(() => box.classList.add("d-none"), ms);
		} else {
			console.log(`[${type.toUpperCase()}] ${msg}`);
		}
	}

	window.notify = notify;
	// ===========================================================
	// ALERTA GLOBAL REUTILIZABLE (usa Bootstrap o fallback simple)
	// ===========================================================
	window.showAlert = function showAlert(id, msg, type = "success") {
		const el = document.getElementById(id);
		if (el) {
			// Caso 1: el elemento existe (por ejemplo, un <div id="perfil-alert">)
			el.textContent = msg;
			el.className = `alert alert-${type}`;
			el.classList.remove("d-none");
			setTimeout(() => el.classList.add("d-none"), 2500);
		} else {
			// Caso 2: fallback si no existe un contenedor de alerta visible
			console.log(`[${type.toUpperCase()}] ${msg}`);
			alert(msg);
		}
	};

	try {
		// Inserta el fragmento del header.
		const res = await fetch(headerURL, { cache: "no-store" });
		if (!res.ok) throw new Error("No se pudo cargar el header: " + headerURL);
		placeholder.innerHTML = await res.text();

		// Navegación según autenticación.
		(async function setupAuthNav() {
			try {
				const authModuleURL = projectRoot + "js/auth.repo.js";
				const {
					getCurrentUser,
					setCurrentUser,
					refreshCurrentUser,
					ensureAdminSeed,
					can,
				} = await import(authModuleURL);

				// Garantiza datos iniciales mínimos (demo).
				await ensureAdminSeed();

				// Estado actual de usuario.
				let user = getCurrentUser();
				user = refreshCurrentUser() || user;

				// Referencias de navegación.
				const navLogin = document.getElementById("nav-login");
				const navLogout = document.getElementById("nav-logout");
				const navUser = document.getElementById("nav-user");
				const navProfile = document.getElementById("nav-profile");
				const navAdmin = document.getElementById("nav-admin");
				const navCart = document.getElementById("btn-cart");
				const navRegister = document.getElementById("nav-register");

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
					hide(navRegister);
					show(navLogout);
					show(navProfile);

					if (navAdmin) {
						if (
							user &&
							user.status === "active" &&
							(user.role === "admin" || can(user, "user:list"))
						) {
							show(navAdmin);
						} else {
							hide(navAdmin);
						}
					}
				} else {
					if (navUser) {
						navUser.textContent = "";
						hide(navUser);
					}
					show(navLogin);
					show(navRegister);
					hide(navLogout);
					hide(navProfile);
					if (navAdmin) hide(navAdmin);
				}

				// Logout: limpia carrito, estado, badge y redirige.
				navLogout?.addEventListener("click", (e) => {
					e.preventDefault();

					try {
						if (window.Cart && typeof Cart.clear === "function") {
							Cart.clear();
						} else {
							localStorage.removeItem("cart");
							sessionStorage?.removeItem?.("cart");
						}
						dispatchEvent(new CustomEvent("cart:updated"));
						const badge = document.getElementById("cart-badge");
						if (badge) badge.textContent = "0";
					} catch (err) {
						console.warn("No se pudo limpiar el carrito en logout:", err);
					}

					setCurrentUser(null);
					window.location.href = projectRoot + "login.html";
				});

				// Protección al navegar al carrito.
				if (navCart) {
					navCart.addEventListener("click", (e) => {
						const u = getCurrentUser();

						// Usuario no logeado → guarda mensaje y redirige
						if (!u) {
							e.preventDefault();
							sessionStorage.setItem(
								"loginRedirectMsg",
								"Debes iniciar sesión para acceder al carrito."
							);
							window.location.href = projectRoot + "login.html";
							return;
						}

						// Usuario inactivo → también guarda mensaje y redirige
						if (u.status && u.status !== "active") {
							e.preventDefault();
							sessionStorage.setItem(
								"loginRedirectMsg",
								"Tu cuenta está deshabilitada. Contacta al administrador."
							);
							window.location.href = projectRoot + "login.html";
							return;
						}
					});
				}



				// Helpers globales para proteger páginas.
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

		// Sincroniza el badge del carrito.
		(function setupCartBadge() {
			const badge = document.getElementById("cart-badge");
			if (!badge) return;

			try {
				const raw = localStorage.getItem("cart");
				const items = raw ? JSON.parse(raw) : [];
				const initialCount = items.reduce((acc, it) => acc + (it.qty || 0), 0);
				badge.textContent = initialCount;
			} catch {
				badge.textContent = 0;
			}

			const updateFromCart = () => {
				if (window.Cart && typeof Cart.count === "function") {
					badge.textContent = Cart.count();
				}
			};

			addEventListener("cart:updated", updateFromCart);
			updateFromCart();
		})();

		// Toggle de menú móvil.
		const toggle = document.querySelector(".nav-toggle");
		const header = document.querySelector(".site-header");
		if (toggle && header) {
			toggle.addEventListener("click", () => {
				const open = header.classList.toggle("open");
				toggle.setAttribute("aria-expanded", open ? "true" : "false");
			});
		}

		// Ajusta variables CSS con el alto real del header fijo.
		const ajustarAlturaHeader = () => {
			const headerEl = document.querySelector(".site-header");
			if (!headerEl) return;
			const h = headerEl.offsetHeight;
			document.documentElement.style.setProperty(
				"--estructura-altura-header",
				h + "px"
			);
			document.documentElement.style.setProperty("--altura-header", h + "px");
		};

		ajustarAlturaHeader();
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
// Carga dinámica del FOOTER reutilizable
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
		if (!res.ok) throw new Error("No se pudo cargar el footer: " + footerURL);
		placeholder.innerHTML = await res.text();
	} catch (err) {
		console.error("Error cargando footer reutilizable:", err);
	}
});
