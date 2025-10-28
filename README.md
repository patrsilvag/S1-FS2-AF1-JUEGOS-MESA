# 🎲 Juegos de Mesa Cuatro Esquinas

## 🌟 Descripción del Proyecto
Este proyecto corresponde al **Front-End del catálogo web** para la PYME “Juegos de Mesa Cuatro Esquinas”.  
El objetivo es mostrar y promocionar los juegos disponibles, cumpliendo con los criterios de diseño, validación y responsividad establecidos en la **actividad DSY2202 – Semana 2**.

---

## 📋 Estructura y Contenido

El sitio incluye:

- **Página Principal (`index.html`)** con acceso a las 4 categorías temáticas:
  - Estrategia  
  - Infantiles  
  - Amigos  
  - Cartas  

- **Páginas de categoría:** `estrategia.html`, `infantiles.html`, `amigos.html` y `cartas.html`.

- **Ficha de juego:** Cada tarjeta contiene **imagen, nombre, descripción, precio y descuento**.

- **Navegación completa:** Todos los enlaces permiten acceder a cualquier sección y volver al inicio.  
  El sitio usa `Bootstrap Navbar` y estructura de grilla para mantener un diseño responsivo.

---

## 🧩 Formulario de Registro (`registro.html`)

Implementa un formulario totalmente funcional con validaciones **en JavaScript puro**, aplicando manipulación del **DOM** y **clases de Bootstrap** para el feedback visual.

### 🧾 Campos:
1. Nombre completo *(obligatorio)*  
2. Nombre de usuario *(obligatorio)*  
3. Correo electrónico *(obligatorio, formato válido)*  
4. Clave *(obligatorio, 6–18 caracteres, con mayúscula y número)*  
5. Repetir clave *(debe coincidir con la anterior)*  
6. Fecha de nacimiento *(obligatorio, mínimo 13 años)*  
7. Dirección *(opcional)*  

### 🧠 Validaciones implementadas en `js/script.js`:
- **Campos obligatorios:** No permiten envío si están vacíos.  
- **Solo letras** para el campo *nombre completo*.  
- **Email válido:** Estructura tipo `usuario@dominio.com`.  
- **Clave segura:**  
  - Longitud entre 6 y 18 caracteres.  
  - Contiene al menos una mayúscula y un número.  
- **Coincidencia de claves.**  
- **Edad mínima (13 años).**  
- **Dirección opcional:** no genera error si está vacía.  
- **Feedback dinámico:** bordes y mensajes de error con `is-valid` / `is-invalid`.  
- **Botones:**
  - `Enviar registro`: valida y muestra alerta de éxito.  
  - `Limpiar`: borra campos y restablece el estado visual.  
- **Validación en tiempo real:** cada campo se revalida al modificarse.

El script está envuelto en `DOMContentLoaded` para evitar errores de carga y cumple con la **pauta DSY2202 – Semana 2**.

---

## 🛠️ Tecnologías Utilizadas

- **HTML5** (semántico)  
- **CSS3 / Bootstrap 5**  
- **JavaScript** (validación, manipulación DOM, feedback visual)  
- **Flexbox / CSS Grid**  
- **Animaciones y Transiciones (`@keyframes`, `transition`)**  
- **Responsividad:** `@media queries` y sistema de grillas Bootstrap (XS → XL)

---

## ✅ Cumplimiento con Instrucciones y Pauta

| Criterio | Estado | Detalle |
|-----------|---------|---------|
| Estructura y navegación del sitio | ✅ | Todas las páginas enlazadas y responsivas |
| Uso de Bootstrap y diseño adaptable | ✅ | Grilla completa y navbar responsivo |
| Validaciones del formulario en JS | ✅ | Cumple todas las reglas requeridas |
| Feedback visual (DOM + CSS dinámico) | ✅ | `is-valid` / `is-invalid` + mensajes |
| Campos requeridos y opcional | ✅ | Dirección opcional, resto obligatorios |
| Integración de eventos y prevención `submit` | ✅ | `preventDefault()`, `reset()` y `alert()` implementados |
| Entrega colaborativa (Git / Trello) | ⚠️ | Incluir los enlaces a continuación |

---

## 🤝 Entrega Colaborativa

**Repositorio GitHub:**  
👉 *https://github.com/patrsilvag/S1-FS2-AF1-JUEGOS-MESA.git*

**Tablero Trello:**  
👉 *(https://trello.com/b/L0CUq9qy/juegos-de-mesa)*

---

## 👨‍💻 Autoría

| Detalle | Información |
|----------|--------------|
| **Curso** | Desarrollo Full Stack II (DSY2202) |
| **Semana** | 2 |
| **Autor** | Patricio Silva |
| **Institución** | I&A Tecnología |
| **Año** | 2025 |

---

## 🧭 Cómo probar

1. Abre `index.html` en tu navegador.  
2. Navega a las categorías y selecciona **“Registro”**.  
3. Completa el formulario con datos válidos y prueba las validaciones.  
4. Usa **Inspeccionar > Consola** para verificar que no hay errores JS.

---

