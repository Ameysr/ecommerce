const express = require('express');
const authRouter = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
authRouter.post('/register', register);
authRouter.post('/login', login);

// Protected route
authRouter.get('/profile', authMiddleware, getProfile);

module.exports = authRouter;