/**
 *  Ruta serverless (Vercel)  →  /api/admin-products
 *
 *  • GET          → lista todos los productos
 *  • POST         → crea un producto      (body JSON)
 *  • PATCH        → actualiza un producto (body JSON con { id, ...campos })
 *  • DELETE ?id=x → elimina el producto   (query-string)
 *
 *  Usa la misma base MySQL en Hostinger.
 *  Las credenciales se leen de las variables de entorno:
 *    - MYSQL_HOST
 *    - MYSQL_USER
 *    - MYSQL_PASSWORD
 *    - MYSQL_DB
 */

const mysql = require('mysql2/promise');

module.exports = async (req, res) => {
  const db = await mysql.createConnection({
    host:     process.env.MYSQL_HOST,
    user:     process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
    port:     process.env.MYSQL_PORT || 3306,
  });

  try {
    switch (req.method) {
      /* ---------- 1. LISTAR ------------------------------------------- */
      case 'GET': {
        const [rows] = await db.query(
          'SELECT * FROM PRODUCTOS ORDER BY Nombre ASC, id ASC'
        );
        return res.status(200).json(rows);
      }

      /* ---------- 2. CREAR -------------------------------------------- */
      case 'POST': {
        const payload = req.body;       // { Nombre, Descripción, … }
        if (!payload || !payload.Nombre) {
          return res.status(400).json({ error: 'Nombre es requerido' });
        }
        const [result] = await db.query('INSERT INTO PRODUCTOS SET ?', payload);
        return res.status(201).json({ id: result.insertId, ...payload });
      }

      /* ---------- 3. ACTUALIZAR --------------------------------------- */
      case 'PATCH': {
        const { id, ...data } = req.body;
        if (!id) return res.status(400).json({ error: 'Falta id' });

        await db.query('UPDATE PRODUCTOS SET ? WHERE id = ?', [data, id]);
        return res.status(200).json({ id, ...data });
      }

      /* ---------- 4. ELIMINAR ----------------------------------------- */
      case 'DELETE': {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: 'Falta id' });

        await db.query('DELETE FROM PRODUCTOS WHERE id = ?', [id]);
        return res.status(204).end();
      }

      /* ---------- Método no permitido --------------------------------- */
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
        return res.status(405).end(`Método ${req.method} no permitido`);
    }
  } catch (err) {
    console.error('DB error:', err);
    return res.status(500).json({ error: err.message });
  } finally {
    await db.end();
  }
};
