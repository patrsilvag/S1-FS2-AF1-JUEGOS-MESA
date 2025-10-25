# 🎲 Juegos de Mesa Cuatro Esquinas

## 🌟 Descripción del Proyecto

Este proyecto consiste en la creación de la interfaz gráfica (front-end) para el catálogo de la PYME "Juegos de Mesa Cuatro Esquinas". El objetivo es promocionar y mostrar el inventario de juegos de mesa, cumpliendo con los requisitos de diseño y estructura modernos.

El sitio web está organizado en una página principal y cuatro secciones de categorías, asegurando una navegación completa y un diseño responsivo en todos los dispositivos.

## 📋 Estructura y Contenido

El sitio cumple con los siguientes requisitos de contenido:

* **Página Principal (`index.html`):** Muestra el listado de **4 categorías** temáticas:
    * Estrategia
    * Infantiles
    * Amigos
    * Cartas
* **Páginas de Categoría:** Se desarrollaron 4 páginas internas (`estrategia.html`, `infantiles.html`, `amigos.html`, `cartas.html).
* **Fichas de Juego:** Cada categoría contiene un máximo de 3 juegos, y cada juego presenta una ficha completa con: Imagen, Nombre, Descripción, Precio y Descuento.
* **Navegación:** Todos los enlaces y menús están operativos, permitiendo el acceso rápido entre categorías y el retorno al inicio.

## 🛠️ Tecnologías y Características Técnicas

El desarrollo integra elementos modernos de HTML5 y CSS3, asegurando la adaptabilidad y el diseño interactivo:

* **Estructura:** **HTML5** con elementos semánticos (`<nav>`, `<main>`, `<footer>`).
* **Diseño Responsivo:** Implementación del **Sistema de Grilla de Bootstrap** con puntos de quiebre (XS, SM, MD, LG) para una correcta visualización en celulares, tablets y monitores grandes.
* **Estilo Avanzado (CSS3):**
    * Uso de **Variables CSS Personalizadas** en el bloque `:root` para la gestión centralizada de colores y fuentes.
    * Uso de **Flexbox** (para navegación) y **CSS Grid** (para el *layout* de las categorías).
    * Más de **4 efectos dinámicos** (Animaciones y Transiciones) para mejorar la interacción:
        * 3 Animaciones con `@keyframes` (ej. `slide-up`, `fade-in`, y la animación de `descuento`).
        * Transiciones suaves (`transition`) en enlaces y tarjetas (`:hover`).
    * Manejo de **`@media` query** para ajustes específicos en dispositivos móviles.

## 🧑‍💻 Autoría

| Detalle | Información |
| **Desarrollado para** | Desarrollo Full Stack II (DSY2202) |
| **Semana** | Semana 1 |
| **Autor(a)** | Patricio Silva |