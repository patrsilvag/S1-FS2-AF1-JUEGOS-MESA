// ===============================
// js/site.js
// Header reutilizable (con ajuste dinámico de altura)
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
  const placeholder = document.getElementById("header-placeholder");
  if (!placeholder) return;

  // Detectar ruta raíz del proyecto
  const path = window.location.pathname;
  const rootMatch = path.match(/^(.*?)(categorias|pages|includes|js|css)\//);
  const projectRoot = rootMatch ? rootMatch[1] : path.replace(/[^/]*$/, "");

  const headerURL = projectRoot + "includes/header.html";

  try {
    // Cargar el fragmento de header
    const res = await fetch(headerURL, { cache: "no-store" });
    if (!res.ok)
      throw new Error("No se pudo cargar el header desde " + headerURL);
    placeholder.innerHTML = await res.text();

    // Activar el botón ☰ (menú móvil)
    const toggle = document.querySelector(".nav-toggle");
    const header = document.querySelector(".site-header");
    if (toggle && header) {
      toggle.addEventListener("click", () => {
        const abierto = header.classList.toggle("open");
        toggle.setAttribute("aria-expanded", abierto ? "true" : "false");
      });
    }

    // ===============================
    // Ajustar padding-top según alto real del header fijo
    // ===============================
    const ajustarAlturaHeader = () => {
      const headerEl = document.querySelector(".site-header");
      if (headerEl) {
        const altura = headerEl.offsetHeight;
        document.documentElement.style.setProperty(
          "--altura-header",
          altura + "px",
        );
      }
    };

    // Ejecutar al cargar
    ajustarAlturaHeader();

    // Volver a ajustar si cambia el tamaño de ventana o el menú se expande
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
    if (!res.ok)
      throw new Error("No se pudo cargar el footer desde " + footerURL);
    placeholder.innerHTML = await res.text();
  } catch (err) {
    console.error("Error cargando footer reutilizable:", err);
  }
});
