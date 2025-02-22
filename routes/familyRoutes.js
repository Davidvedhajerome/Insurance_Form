const express = require('express');
const router = express.Router();
const { submitFamilyForm } = require('../controllers/familyController');

// POST route to handle form submission
router.post('/submit-form', submitFamilyForm);

module.exports = router;
