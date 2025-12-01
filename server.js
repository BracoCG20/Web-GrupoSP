require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const app = express();
const port = process.env.PORT || 4001;
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
const whitelist = [
  'https://gruposp.pe',
  'https://www.gruposp.pe',
  'http://localhost:4001',
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Bloqueado por CORS: Tu origen no está permitido.'));
      }
    },
  })
);
const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: 'Has excedido el límite de envíos. Intenta de nuevo en 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
);
app.get('/nosotros', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'nosotros.html'))
);
app.get('/empresas', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'empresas.html'))
);
app.get('/contacto', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'contacto.html'))
);
app.get('/en', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'en', 'index.html'))
);
app.get('/en/aboutus', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'en', 'aboutus.html'))
);
app.get('/en/companies', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'en', 'companies.html'))
);
app.get('/en/contact', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'en', 'contact.html'))
);
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
app.post('/enviar-correo', emailLimiter, (req, res) => {
  if (req.body._gotcha) {
    return res.status(400).json({ error: 'Bot detectado' });
  }
  const { nombre, correo, compania, mensaje, name, company, email, message } =
    req.body;
  const finalName = nombre || name;
  const finalEmail = correo || email;
  const finalCompany = compania || company || 'No especificada';
  const finalMessage = mensaje || message;
  if (!finalName || !finalEmail || !finalMessage) {
    return res.status(400).json({ error: 'Faltan datos obligatorios.' });
  }
  const cleanMessage = finalMessage.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const mailOptions = {
    from: `"Web Grupo SP" <${process.env.EMAIL_USER}}>`,
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
                <p style="background: #f9f9f9; padding: 15px; border-radius: 5px;">${cleanMessage}</p>
            </div>
        `,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error envío:', error);
      return res.status(500).json({ error: 'Error interno al enviar.' });
    }
    res.status(200).json({ success: 'Enviado correctamente' });
  });
});
app.listen(port, () => {
  console.log(`✅ Servidor corriendo en puerto ${port}`);
});
