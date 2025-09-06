const express = require('express');
const itemRouter = express.Router();
const {
    createItem,
    getItems,
    getItem,
    updateItem,
    deleteItem
} = require('../controllers/itemController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Public routes
itemRouter.get('/', getItems);
itemRouter.get('/:id', getItem);

// Protected admin routes
itemRouter.post('/', authMiddleware, adminMiddleware, createItem);
itemRouter.put('/:id', authMiddleware, adminMiddleware, updateItem);
itemRouter.delete('/:id', authMiddleware, adminMiddleware, deleteItem);

module.exports = itemRouter;