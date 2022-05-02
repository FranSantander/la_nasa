const { Pool } = require("pg");
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  password: "postgresql",
  database: "nasa",
  port: 5432,
});

async function nuevoUsuario(email, nombre, password) {
  const result = await pool.query(
    `INSERT INTO usuarios (email, nombre, password, auth) values ('${email}', '${nombre}','${password}', false) RETURNING *;`
  );
  const usuario = result.rows[0];
  return usuario;
}
async function getUsuarios() {
  const result = await pool.query(`SELECT * FROM usuarios`);
  return result.rows;
}
async function setUsuarioStatus(id, auth) {
  const result = await pool.query(
    `UPDATE usuarios SET auth = ${auth} WHERE id = ${id} RETURNING *;`
  );
  const usuario = result.rows[0];
  return usuario;
}
async function getUsuario(email, password) {
  const result = await pool.query(
    `SELECT * FROM usuarios WHERE email = '${email}' AND password = '${password}'`
  );
  return result.rows[0];
}

module.exports = { nuevoUsuario, getUsuarios, setUsuarioStatus, getUsuario };
