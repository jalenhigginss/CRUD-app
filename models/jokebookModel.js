/** Name: Jalen Higgins | File: /models/jokebookModel.js */
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function getCategories() {
  const { rows } = await pool.query('SELECT DISTINCT category FROM jokes ORDER BY category');
  return rows.map(r => r.category);
}

async function getJokesByCategory(category, limit) {
  const params = [category];
  let sql = 'SELECT id, category, setup, delivery, created_at FROM jokes WHERE category = $1 ORDER BY id DESC';
  if (limit && Number.isInteger(+limit) && +limit > 0) {
    params.push(+limit);
    sql += ' LIMIT $2';
  }
  const { rows } = await pool.query(sql, params);
  return rows;
}

async function getRandomJoke(category) {
  if (category) {
    const { rows } = await pool.query(
      'SELECT id, category, setup, delivery, created_at FROM jokes WHERE category = $1 ORDER BY random() LIMIT 1',
      [category]
    );
    return rows[0] || null;
  }
  const { rows } = await pool.query(
    'SELECT id, category, setup, delivery, created_at FROM jokes ORDER BY random() LIMIT 1'
  );
  return rows[0] || null;
}

async function addJoke({ category, setup, delivery }) {
  const { rows } = await pool.query(
    `INSERT INTO jokes (category, setup, delivery)
     VALUES ($1, $2, $3)
     RETURNING id, category, setup, delivery, created_at`,
    [category, setup, delivery]
  );
  return rows[0];
}

async function addJokesBulk(category, jokes) {
  const values = [];
  const params = [];
  let p = 1;
  for (const j of jokes) {
    params.push(category, j.setup, j.delivery);
    values.push(`($${p}, $${p+1}, $${p+2})`);
    p += 3;
  }
  if (!values.length) return [];
  const { rows } = await pool.query(
    `INSERT INTO jokes (category, setup, delivery)
     VALUES ${values.join(',')}
     RETURNING id, category, setup, delivery, created_at`,
    params
  );
  return rows;
}

module.exports = {
  getCategories,
  getJokesByCategory,
  getRandomJoke,
  addJoke,
  addJokesBulk
};
