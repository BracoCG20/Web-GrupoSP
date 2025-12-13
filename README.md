# FullStack - Sitio Web Corporativo

Este repositorio contiene el código fuente del sitio web corporativo, un holding latinoamericano enfocado en creatividad, estrategia y expansión.

La aplicación está construida sobre **Node.js** y **Express**, sirviendo contenido estático optimizado y gestionando el envío de correos electrónicos de manera segura y eficiente.

## 🚀 Características Principales

- **Multilenguaje:** Soporte nativo para Español (raíz) e Inglés (`/en`).
- **Seguridad Robusta:**
  - **Helmet:** Configuración avanzada de cabeceras HTTP y Content Security Policy (CSP).
  - **CORS:** Restricción de orígenes permitidos para evitar uso no autorizado de recursos.
  - **Rate Limiting:** Protección contra ataques de fuerza bruta y spam en el formulario de contacto.
  - **Sanitización:** Limpieza estricta de inputs con `express-validator` para prevenir inyecciones XSS.
  - **Honeypot:** Protección antispam oculta (`_gotcha`) en los formularios.
- **Performance:**
  - Compresión **Gzip** habilitada para respuestas HTTP.
  - Imágenes optimizadas en formato **WebP**.
  - Implementación de carga diferida (`lazy loading`).
- **Frontend Moderno:**
  - Estilos modulares con **SASS/SCSS**.
  - Animaciones fluidas con **AOS**.
  - Sliders interactivos con **SwiperJS**.

## 🛠️ Stack Tecnológico

- **Backend:** Node.js, Express.
- **Motor de Email:** Nodemailer (SMTP Gmail).
- **Frontend:** HTML5, CSS3 (SASS), Vanilla JavaScript.
- **Librerías Clave:** `helmet`, `cors`, `express-rate-limit`, `compression`, `express-validator`.

## 📋 Requisitos Previos

- **Node.js** (Versión 16 o superior recomendada).
- **NPM** (Gestor de paquetes).

## 🔧 Instalación y Configuración Local

1.  **Clonar el repositorio:**

    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd sp-pages
    ```

2.  **Instalar dependencias:**

    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno:**
    Crea un archivo `.env` en la raíz del proyecto (este archivo no debe subirse al repositorio público) y añade las siguientes variables:

    ```env
    PORT=4001
    NODE_ENV=development

    # Configuración de Correo (Ej. Gmail App Password)
    EMAIL_USER=tu_correo@example.com
    EMAIL_PASS=tu_contraseña_de_aplicacion
    EMAIL_TO=correo_destino@example.lat
    ```

4.  **Ejecutar en Desarrollo:**
    ```bash
    npm start
    # O manualmente: node server.js
    ```
    La aplicación estará disponible en `http://localhost:4001`.

## 📦 Recomendaciones para Producción

Para un despliegue seguro y estable en cualquier servidor o VPS:

1.  **Instalación Limpia:**
    Ejecuta `npm install --production` en el servidor para instalar solo las dependencias necesarias.

2.  **Variables de Entorno:**
    Asegúrate de configurar el archivo `.env` en el servidor con `NODE_ENV=production`. Esto activa optimizaciones de rendimiento en Express.

3.  **Gestor de Procesos (PM2):**
    Se recomienda usar **PM2** para mantener la aplicación activa y gestionar reinicios automáticos:
    ```bash
    pm2 start server.js --name "grupo-sp-web"
    pm2 save
    ```

## 🔒 Seguridad (CSP)

Este proyecto implementa una **Content Security Policy (CSP)** estricta mediante `helmet` en `server.js`.

Si necesitas agregar scripts externos, fuentes o estilos desde CDNs que no estén actualmente en uso, deberás agregarlos manualmente a la lista blanca (`whitelist`) en la configuración de `helmet`, de lo contrario, el navegador bloqueará su ejecución por seguridad.

## 📂 Estructura del Proyecto
```
├── public/ # Archivos estáticos (HTML, CSS, JS, Img)
│ ├── css/ # CSS compilado
│ ├── sass/ # Archivos fuente SCSS
│ ├── js/ # Lógica frontend
│ ├── images/ # Activos optimizados (WebP)
│ └── en/ # Versión en Inglés del sitio
├── server.js # Punto de entrada del servidor (Lógica Backend)
├── package.json # Dependencias y scripts
└── .env # Variables de entorno (No incluido en repo)
```
## © Créditos y Licencia

**Desarrollado por Cristian Braco.**
Todos los derechos reservados.
