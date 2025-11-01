/** Name: Jalen Higgins | File: /controllers/jokebookController.js */
const model = require('../models/jokebookModel');

// Wrap async handlers
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Extra credit helper: fetch up to 3 two-part jokes if category missing
async function fetchExternalJokes(category) {
  const url = `https://v2.jokeapi.dev/joke/${encodeURIComponent(category)}?type=twopart&amount=3&safe-mode`;
  const r = await fetch(url);
  if (!r.ok) return [];
  const data = await r.json();
  const list = Array.isArray(data.jokes) ? data.jokes : (data.type === 'twopart' ? [data] : []);
  return list
    .filter(j => j.type === 'twopart' && j.setup && j.delivery)
    .slice(0, 3)
    .map(j => ({ setup: j.setup, delivery: j.delivery }));
}

// --- CONTROLLER FUNCS ---

// GET /jokebook/categories
const getCategories = asyncHandler(async (_req, res) => {
  const categories = await model.getCategories();
  res.json({ categories });
});

// GET /jokebook/category/:category  (?limit=)
const getByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { limit } = req.query;

  let jokes = await model.getJokesByCategory(category, limit);

  // Extra credit path
  if (!jokes.length) {
    const ext = await fetchExternalJokes(category);
    if (ext.length) {
      await model.addJokesBulk(category, ext);
      jokes = await model.getJokesByCategory(category, limit);
    }
  }

  if (!jokes.length) return res.status(404).json({ error: `No jokes found for category: ${category}` });
  res.json({ count: jokes.length, jokes });
});

// GET /jokebook/random  (?category=)
const getRandom = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const joke = await model.getRandomJoke(category);
  if (!joke) return res.status(404).json({ error: 'No jokes found' });
  res.json(joke);
});

// POST /jokebook/joke/add  { category, setup, delivery }
const addJoke = asyncHandler(async (req, res) => {
  const { category, setup, delivery } = req.body;
  if (!category || !setup || !delivery) {
    const err = new Error('category, setup, and delivery are required');
    err.status = 400;
    throw err;
  }
  await model.addJoke({ category, setup, delivery });
  const jokes = await model.getJokesByCategory(category);
  res.status(201).json({ category, count: jokes.length, jokes });
});

module.exports = { getCategories, getByCategory, getRandom, addJoke };
