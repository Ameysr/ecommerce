const Cart = require('../models/cart');
const Item = require('../models/items');

// Get user's cart
const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id })
            .populate('items.item', 'name price imageUrl');
            
        if (!cart) {
            return res.status(200).json({
                success: true,
                cart: {
                    items: [],
                    total: 0
                }
            });
        }

        res.status(200).json({
            success: true,
            cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching cart',
            error: error.message
        });
    }
};

// Add item to cart
const addToCart = async (req, res) => {
    try {
        const { itemId, quantity = 1 } = req.body;
        
        // Validate input
        if (!itemId) {
            return res.status(400).json({
                success: false,
                message: 'Item ID is required'
            });
        }

        // Check if item exists
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        // Check if item is in stock
        if (item.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock'
            });
        }

        // Find user's cart or create one if it doesn't exist
        let cart = await Cart.findOne({ user: req.user.id });
        
        if (!cart) {
            cart = new Cart({
                user: req.user.id,
                items: []
            });
        }

        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex(
            cartItem => cartItem.item.toString() === itemId
        );

        if (existingItemIndex > -1) {
            // Update quantity if item already in cart
            const newQuantity = cart.items[existingItemIndex].quantity + quantity;
            
            // Check stock again with updated quantity
            if (item.stock < newQuantity) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot add more than available stock'
                });
            }
            
            cart.items[existingItemIndex].quantity = newQuantity;
        } else {
            // Add new item to cart
            cart.items.push({
                item: itemId,
                quantity
            });
        }

        // Recalculate total (this will be done by the pre-save middleware)
        await cart.save();
        
        // Populate the item details before sending response
        await cart.populate('items.item', 'name price imageUrl');
        
        res.status(200).json({
            success: true,
            message: 'Item added to cart',
            cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error adding to cart',
            error: error.message
        });
    }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;
        
        // Validate input
        if (quantity === undefined || quantity < 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid quantity is required'
            });
        }

        // Find user's cart
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        // Find the item in cart
        const cartItem = cart.items.find(
            item => item.item.toString() === itemId
        );
        
        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        // Check if item exists and has sufficient stock
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in database'
            });
        }

        if (quantity > item.stock) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock'
            });
        }

        if (quantity === 0) {
            // Remove item if quantity is 0
            cart.items = cart.items.filter(
                item => item.item.toString() !== itemId
            );
        } else {
            // Update quantity
            cartItem.quantity = quantity;
        }

        await cart.save();
        await cart.populate('items.item', 'name price imageUrl');
        
        res.status(200).json({
            success: true,
            message: 'Cart updated successfully',
            cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error updating cart',
            error: error.message
        });
    }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.params;
        
        // Find user's cart
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        // Remove the item
        const initialLength = cart.items.length;
        cart.items = cart.items.filter(
            item => item.item.toString() !== itemId
        );
        
        if (cart.items.length === initialLength) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        await cart.save();
        await cart.populate('items.item', 'name price imageUrl');
        
        res.status(200).json({
            success: true,
            message: 'Item removed from cart',
            cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error removing from cart',
            error: error.message
        });
    }
};

// Clear entire cart
const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });
        
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        cart.items = [];
        await cart.save();
        
        res.status(200).json({
            success: true,
            message: 'Cart cleared successfully',
            cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error clearing cart',
            error: error.message
        });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};