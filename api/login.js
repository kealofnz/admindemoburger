export default async function handler(req, res) {
  const { user, password } = req.body;

  // Leer usuario y password de .env
  const ADMIN_USER = process.env.ADMIN_USER;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!user || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
  }

  if (user === ADMIN_USER && password === ADMIN_PASSWORD) {
    return res.status(200).json({ success: true }); // ✅ Login exitoso
  } else {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' }); // ❌ No autorizado
  }
}
