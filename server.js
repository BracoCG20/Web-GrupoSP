require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const { body, validationResult } = require("express-validator");

const app = express();
const port = process.env.PORT || 4001;

app.set('trust proxy', 1);
app.use(compression());
// 1. Compresión Gzip
app.use(compression());

// 2. Seguridad Helmet (CONFIGURACIÓN CORREGIDA)
app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"],
				// 'unsafe-inline' permite tus scripts <script>...</script> en el HTML (AOS, JSON-LD)
				scriptSrc: [
					"'self'",
					"'unsafe-inline'",
					"https://kit.fontawesome.com",
					"https://cdn.jsdelivr.net",
					"https://unpkg.com",
					"https://cdn.vercel-analytics.com",
					"https://va.vercel-scripts.com",
				],
				// Estilos y fuentes externas
				styleSrc: [
					"'self'",
					"'unsafe-inline'",
					"https://fonts.googleapis.com",
					"https://cdn.jsdelivr.net",
					"https://unpkg.com",
					"https://kit.fontawesome.com",
				],
				fontSrc: [
					"'self'",
					"https://fonts.gstatic.com",
					"https://ka-f.fontawesome.com",
					"https://cdn.jsdelivr.net", // A veces Swiper carga fuentes desde aquí
				],
				// Imágenes de cualquier fuente segura (https) y data: (base64)
				imgSrc: ["'self'", "data:", "https:"],
				// Conexiones permitidas (Swiper y FontAwesome hacen peticiones de fondo)
				connectSrc: [
					"'self'",
					"https://ka-f.fontawesome.com",
					"https://cdn.jsdelivr.net",
					"https://unpkg.com",
					"https://vitals.vercel-insights.com",
				],
			},
		},
		crossOriginEmbedderPolicy: false,
	})
);

const whitelist = [
	"https://gruposp.pe",
	"https://www.gruposp.pe",
	"http://localhost:4001",
	"https://web-full-stack-self.vercel.app",
];

app.use(
	cors({
		origin: function (origin, callback) {
			if (!origin || whitelist.indexOf(origin) !== -1) {
				callback(null, true);
			} else {
				callback(new Error("Bloqueado por CORS: Tu origen no está permitido."));
			}
		},
	})
);

const emailLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 5,
	message: {
		error: "Has excedido el límite de envíos. Intenta de nuevo en 15 minutos.",
	},
	standardHeaders: true,
	legacyHeaders: false,
});

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(express.static(path.join(__dirname, "public")));

// --- RUTAS ---
app.get("/", (req, res) =>
	res.sendFile(path.join(__dirname, "public", "index.html"))
);
app.get("/nosotros", (req, res) =>
	res.sendFile(path.join(__dirname, "public", "nosotros.html"))
);
app.get("/empresas", (req, res) =>
	res.sendFile(path.join(__dirname, "public", "empresas.html"))
);
app.get("/contacto", (req, res) =>
	res.sendFile(path.join(__dirname, "public", "contacto.html"))
);
app.get("/en", (req, res) =>
	res.sendFile(path.join(__dirname, "public", "en", "index.html"))
);
app.get("/en/aboutus", (req, res) =>
	res.sendFile(path.join(__dirname, "public", "en", "aboutus.html"))
);
app.get("/en/companies", (req, res) =>
	res.sendFile(path.join(__dirname, "public", "en", "companies.html"))
);
app.get("/en/contact", (req, res) =>
	res.sendFile(path.join(__dirname, "public", "en", "contact.html"))
);

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

app.post(
	"/enviar-correo",
	emailLimiter,
	[
		// Validaciones básicas
		body("nombre").optional().trim().escape(),
		body("name").optional().trim().escape(),
		body("correo").optional().isEmail().normalizeEmail(),
		body("email").optional().isEmail().normalizeEmail(),
		body("mensaje").optional().trim().escape(),
		body("message").optional().trim().escape(),
		body("_gotcha").trim(),
	],
	(req, res) => {
		// Verificar Honeypot
		if (req.body._gotcha) {
			return res.status(400).json({ error: "Bot detectado" });
		}

		// Verificar errores de validación
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res
				.status(400)
				.json({ error: "Datos inválidos", details: errors.array() });
		}

		const { nombre, correo, compania, mensaje, name, company, email, message } =
			req.body;
		const finalName = nombre || name;
		const finalEmail = correo || email;
		const finalCompany = compania || company || "No especificada";
		const finalMessage = mensaje || message;

		if (!finalName || !finalEmail || !finalMessage) {
			return res.status(400).json({ error: "Faltan datos obligatorios." });
		}

		const mailOptions = {
			from: `"Web Grupo SP" <${process.env.EMAIL_USER}>`,
			to: process.env.EMAIL_TO,
			replyTo: finalEmail,
			subject: `[WEB] Nuevo mensaje de ${finalName}`,
			html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius:5px;">
                <h3 style="color: #333;">Nuevo contacto desde la web</h3>
                <ul style="list-style: none; padding: 0;">
                    <li><b>Nombre:</b> ${finalName}</li>
                    <li><b>Correo:</b> ${finalEmail}</li>
                    <li><b>Empresa:</b> ${finalCompany}</li>
                </ul>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p><b>Mensaje:</b></p>
                <p style="background: #f9f9f9; padding: 15px; border-radius: 5px;">${finalMessage}</p>
            </div>
        `,
		};

		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				console.error("Error envío:", error);
				return res.status(500).json({ error: "Error interno al enviar." });
			}
			res.status(200).json({ success: "Enviado correctamente" });
		});
	}
);

// app.listen(port, () => {
//   console.log(`✅ Servidor corriendo en puerto ${port}`);
// });

if (require.main === module) {
	app.listen(port, () => {
		console.log(`✅ Servidor corriendo en puerto ${port}`);
	});
}

module.exports = app;
