# 🎲 Juegos de Mesa Cuatro Esquinas

## 🌟 Descripción del Proyecto

Sitio web **Front-End** para la PYME *“Juegos de Mesa Cuatro Esquinas”*, creado como catálogo digital y sistema de registro de usuarios.  
Incluye navegación por categorías, renderizado dinámico de productos y validaciones de formulario en JavaScript.

---

## 📁 Estructura del Proyecto

```
/
├── index.html
├── registro.html
├── login.html
├── perfil.html
├── carrito.html
├── admin.html
├── recuperar.html
│
├── categorias/
│   ├── estrategia.html
│   ├── infantiles.html
│   ├── amigos.html
│   └── cartas.html
│
├── includes/
│   ├── header.html
│   └── footer.html
│
├── css/
│   └── estilos.css
│
├── js/
│   ├── admin.js
│   ├── auth.repo.js
│   ├── cart.state.js
│   ├── cart.ui.js
│   ├── cart.unauthorized.js
│   ├── perfil.js
│   ├── productos.js
│   ├── render-productos.js
│   ├── site.js
│   └── validaciones.js
│
└── img/
    ├── *.jpg / *.ico (imágenes de productos y categorías)
```

---

## 🧭 Navegación del Sitio

El sitio cuenta con un **encabezado y pie de página reutilizables**, cargados dinámicamente mediante `includes/header.html` y `includes/footer.html` a través de `site.js`.

### Páginas principales:

- **Inicio (`index.html`)** → muestra las 4 categorías con cards visuales.  
- **Categorías (`/categorias/*.html`)** → renderizan productos dinámicamente desde `js/productos.js`.  
- **Registro (`registro.html`)** → formulario con validaciones completas en JS.  
- **Login / Perfil / Carrito / Recuperar / Admin** → estructuras preparadas para funcionalidades adicionales (autenticación y carrito).

---

## 🧩 Renderizado de Productos

**Archivo:** `js/render-productos.js`

- Genera tarjetas con imagen, nombre, descripción, precio y etiqueta de descuento.  
- Usa una función interna `formatoCLP()` para mostrar precios en pesos chilenos.  
- Las cards son responsivas (1–4 por fila según ancho).  
- Botón “Agregar” con clase `btn-agregar` para futura integración con el carrito.

**Datos de productos:** `js/productos.js`  
Contiene un array global `window.PRODUCTOS` con los datos de cada juego:  
nombre, categoría, descripción, precio, imagen y descuento.

---

## 🧠 Validaciones de Formulario

**Archivo:** `js/validaciones.js`  
Aplica a `registro.html`, `login.html` y otros formularios.  
Funciones principales:

| Función | Descripción |
|----------|--------------|
| `emailValido(email)` | Verifica formato `usuario@dominio.com` |
| `validarClave(clave)` | Entre 6 y 18 caracteres, **debe incluir mayúscula y número o carácter especial** |
| `clavesIguales(a,b)` | Confirma coincidencia entre las claves |
| `setFeedback(input, ok, msg)` | Muestra u oculta mensaje de error dinámico bajo cada campo |
| `setupLoginPage()` | Inicializa validación y comportamiento de login |

> ✅ No se aplica validación de edad ni campo de fecha de nacimiento.  
> Los campos del formulario incluyen nombre completo, correo, usuario, clave, repetir clave y dirección (opcional).

---

## ⚙️ Funciones Globales (`site.js`)

- Aplica restricciones a campos con atributo `data-only-digits` (solo dígitos, con control de longitud y validación al teclear o pegar).  
- Inserta dinámicamente los **includes de header y footer**.  
- Gestiona algunos comportamientos globales de interfaz.

---

## 🎨 Estilos (`css/estilos.css`)

- Basado en **Bootstrap 5.3**.  
- Colores primarios personalizados, sombras suaves, esquinas redondeadas y tipografía moderna.  
- Adaptación responsive mediante grillas Bootstrap (`col-*`, `row-cols-*`, `g-*`).  
- Efectos hover y transiciones para mejorar la UX.

---

## 🧰 Tecnologías Utilizadas

- **HTML5 semántico**
- **CSS3 / Bootstrap 5.3**
- **JavaScript (ES6+)**
- **Módulos import/export**
- **Manipulación dinámica del DOM**
- **Fetch y SessionStorage (login)**

---

## ✅ Cumplimiento y Calidad

| Criterio | Estado | Descripción |
|-----------|---------|-------------|
| Estructura modular HTML/JS/CSS | ✅ | Componentes y scripts separados |
| Header/Footer dinámicos | ✅ | Cargados vía JS |
| Validaciones form | ✅ | En tiempo real con mensajes de error |
| Clave segura (mayúscula + número o carácter especial) | ✅ | Implementado |
| Diseño responsivo y moderno | ✅ | Basado en Bootstrap |
| Código legible y documentado | ✅ | Comentarios y nombres claros |

---

## 🔗 Recursos

- **Repositorio GitHub:**  
  [https://github.com/patrsilvag/S1-FS2-AF1-JUEGOS-MESA](https://github.com/patrsilvag/S1-FS2-AF1-JUEGOS-MESA)

- **Tablero Trello:**  
  [https://trello.com/b/L0CUq9qy/juegos-de-mesa](https://trello.com/b/L0CUq9qy/juegos-de-mesa)

---

## 👨‍💻 Autor

| Campo | Información |
|--------|--------------|
| **Autor** | Patricio Silva |
| **Curso** | Desarrollo Full Stack II (DSY2202) |
| **Año** | 2025 |

---

## 🚀 Cómo Probar

1. Abre `index.html` en tu navegador.  
2. Navega entre las categorías y productos.  
3. Accede a **“Registro”** y prueba las validaciones del formulario.  
4. Usa las herramientas de desarrollador → *Consola* para observar mensajes JS.  
