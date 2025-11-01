/**
 * Name: Jalen Higgins
 * Date: 11.01.2025
 * File: /public/js/main.js
 * Desc: Client-side behaviors: fetch endpoints, DOM updates, and form handling.
 */

/**
 * Perform a JSON fetch to the server API.
 * @param {string} path - Relative API path (e.g., "/jokebook/random").
 * @param {RequestInit} [options] - Fetch options.
 */
async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * Load and display a random joke.
 */
async function loadRandomJoke() {
  const out = document.getElementById('randomOut');
  out.textContent = 'Loading...';
  try {
    const joke = await api('/jokebook/random');
    out.textContent = `${joke.setup}\n\n${joke.delivery}\n\n(category: ${joke.category})`;
  } catch (e) {
    out.textContent = `Error: ${e.message}`;
  }
}

// Run once when page loads
window.addEventListener('DOMContentLoaded', loadRandomJoke);

// Run again whenever the button is clicked
document.getElementById('getRandom')?.addEventListener('click', loadRandomJoke);


// Load Categories
document.getElementById('loadCategories')?.addEventListener('click', async () => {
  const list = document.getElementById('categoryList');
  list.innerHTML = '';
  try {
    const data = await api('/jokebook/categories');
    data.categories.forEach(cat => {
      const li = document.createElement('li');
      li.textContent = cat;
      list.appendChild(li);
    });
  } catch (e) {
    const li = document.createElement('li');
    li.textContent = `Error: ${e.message}`;
    list.appendChild(li);
  }
});

// Get by Category
document.getElementById('getByCat')?.addEventListener('click', async () => {
  const cat = document.getElementById('byCatInput').value.trim();
  const limit = document.getElementById('limitInput').value.trim();
  const out = document.getElementById('byCatOut');
  out.textContent = 'Loading...';
  if (!cat) {
    out.textContent = 'Enter a category';
    return;
  }
  try {
    const q = limit ? `?limit=${encodeURIComponent(limit)}` : '';
    const data = await api(`/jokebook/category/${encodeURIComponent(cat)}${q}`);
    out.textContent = JSON.stringify(data, null, 2);
  } catch (e) {
    out.textContent = `Error: ${e.message}`;
  }
});

// Add Joke
document.getElementById('addForm')?.addEventListener('submit', async (evt) => {
  evt.preventDefault();
  const form = evt.currentTarget;
  const out = document.getElementById('addOut');
  out.textContent = 'Submitting...';
  try {
    const payload = {
      category: form.category.value.trim(),
      setup: form.setup.value.trim(),
      delivery: form.delivery.value.trim()
    };
    const data = await api('/jokebook/joke/add', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    out.textContent = `Added! Category "${data.category}" now has ${data.count} jokes.`;
    form.reset();
  } catch (e) {
    out.textContent = `Error: ${e.message}`;
  }
});
