# MichiPhone — Tienda de Celulares

Página web moderna y responsive para la venta de celulares iPhone.

## Requisitos

- Un navegador web moderno (Chrome, Firefox, Edge, Safari).
- Un servidor estático local para servir los archivos (los JSON no se cargan con `file://`).

## Cómo ejecutar el proyecto

### Opción 1: Live Server en VS Code (Recomendado)

1. Abre la carpeta `WebMichiphone` en Visual Studio Code.
2. Instala la extensión **Live Server** si no la tienes:
   - Ve a Extensiones (`Ctrl+Shift+X`).
   - Busca "Live Server" por Ritwick Dey.
   - Instala la extensión.
3. Haz clic derecho en `index.html` y selecciona **"Open with Live Server"**.
4. El navegador se abrirá automáticamente en `http://127.0.0.1:5500/index.html`.

### Opción 2: Servidor local con Python

```bash
# Python 3
cd WebMichiphone
python -m http.server 8080

# Luego abre http://localhost:8080 en tu navegador
```

### Opción 3: Servidor local con Node.js

```bash
npx serve .
# Luego abre la URL que muestre en consola
```

## Estructura del proyecto

```
WebMichiphone/
│
├── index.html              # Página principal (catálogo)
├── detalle.html            # Página de detalle del equipo
│
├── css/
│   ├── styles.css          # Estilos principales
│   └── detalle.css         # Estilos de la página de detalle
│
├── js/
│   ├── app.js              # Lógica del catálogo y filtros
│   └── detalle.js          # Lógica del detalle y slider
│
├── json/
│   ├── equipos.json        # Datos de los equipos
│   └── fotos.json          # Fotografías adicionales
│
├── img/                    # Imágenes de los equipos y logo
│   ├── logo-michiphone.png # Logo (opcional, hay fallback de texto)
│   ├── fotopordefecto.jpg  # Imagen por defecto si no se encuentra la foto
│   ├── equipo1foto1.png    # Foto principal del equipo 1
│   ├── equipo1foto2.png    # Foto adicional del equipo 1
│   └── ...
│
└── README.md
```

## Imágenes

Las imágenes de los equipos deben colocarse en la carpeta `img/`.

Cada equipo referencia sus fotos desde los archivos JSON:

- **`equipos.json`**: contiene `UrlFotoPrincipal` (ej: `img/equipo1foto1.png`).
- **`fotos.json`**: contiene fotos adicionales con `UrlFoto` (ej: `img/equipo1foto2.png`).

### Convención de nombres

```
img/equipo{Id}foto{N}.png
```

Donde `{Id}` es el identificador del equipo y `{N}` es el número de la foto (1 = principal).

Si una imagen no existe o no se encuentra en la ruta especificada, se mostrará automáticamente `img/fotopordefecto.jpg` tanto en las cards del catálogo como en el detalle (slider/galería).

### Logo

Coloca el logo como `img/logo-michiphone.png`. Si no existe, se muestra el texto estilizado "MichiPhone".

## Agregar nuevos equipos

1. Agrega el equipo en `json/equipos.json` siguiendo la estructura existente.
2. Agrega las fotos adicionales en `json/fotos.json` con el `IdEquipo` correspondiente.
3. Coloca las imágenes en la carpeta `img/`.
4. Recarga la página. No es necesario modificar código HTML, CSS ni JavaScript.

### Ejemplo de nuevo equipo

**equipos.json:**
```json
{
  "Id": 11,
  "Modelo": "iPhone 16",
  "Capacidad": "256GB",
  "Color": "Negro",
  "Precio": 600.00,
  "PrecioOferta": 540.00,
  "HayDescuento": true,
  "PorcentajeDescuento": 10,
  "UrlFotoPrincipal": "img/equipo11foto1.png",
  "Descripcion": "Equipo nuevo, sellado. Incluye garantía de 12 meses.",
  "FechaIngreso": "20/10/2026",
  "EsLiquidacion": false
}
```

**fotos.json:**
```json
{
  "IdEquipo": 11,
  "UrlFoto": "img/equipo11foto2.png"
}
```

## Tecnologías utilizadas

- **HTML5** — Estructura semántica.
- **CSS3** — Estilos, variables CSS, media queries, responsive design.
- **JavaScript vanilla** — Lógica de la aplicación.
- **jQuery 3.7.1** — Manipulación del DOM y eventos.
- **Slick Carousel 1.8.1** — Slider de imágenes en la página de detalle.
- **Font Awesome 6.5** — Iconos.
- **Google Fonts (Inter)** — Tipografía.

Todas las librerías se cargan desde CDN, no requieren instalación.

## Funcionalidades

- Catálogo dinámico generado desde JSON.
- Filtro por modelo (búsqueda en tiempo real).
- Filtro por capacidad (selector dinámico).
- Combinación de filtros.
- Detalle del equipo con galería de imágenes (Slick Carousel).
- Miniaturas navegables.
- Botón de WhatsApp con mensaje personalizado.
- Precios con y sin descuento.
- Etiquetas de liquidación.
- Diseño responsive (mobile-first).
- Estados de carga, error y vacío.
- Fallback visual para imágenes faltantes.

## Contacto

WhatsApp: [+51 922 072 450](https://wa.me/51922072450)
