/** Name: Jalen Higgins | File: /routes/jokebookRoutes.js */
const express = require('express');
const controller = require('../controllers/jokebookController');

const router = express.Router();

if (!controller || typeof controller.getCategories !== 'function') {
  console.error('Controller exports:', controller);
  throw new Error('jokebookController did not export expected functions');
}

router.get('/categories', controller.getCategories);
router.get('/category/:category', controller.getByCategory);
router.get('/random', controller.getRandom);
router.post('/joke/add', controller.addJoke);

module.exports = router; 
