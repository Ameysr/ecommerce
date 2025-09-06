const express = require('express');
const cartRouter = express.Router();
const {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');

// All cart routes require authentication
router.use(authMiddleware);

cartRouter.get('/', getCart);
cartRouter.post('/add', addToCart);
cartRouter.put('/update/:itemId', updateCartItem);
cartRouter.delete('/remove/:itemId', removeFromCart);
cartRouter.delete('/clear', clearCart);

module.exports = cartRouter;