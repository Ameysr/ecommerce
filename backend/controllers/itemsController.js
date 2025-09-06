const Item = require('../models/Item');

// Create a new item (Admin only)
const createItem = async (req, res) => {
    try {
        const { name, description, price, category, imageUrl, stock } = req.body;
        
        // Validate required fields
        if (!name || !description || !price || !category || !stock) {
            return res.status(400).json({
                success: false,
                message: 'Name, description, price, category, and stock are required fields'
            });
        }

        // Check if item with same name already exists
        const existingItem = await Item.findOne({ name });
        if (existingItem) {
            return res.status(400).json({
                success: false,
                message: 'An item with this name already exists'
            });
        }

        // Create new item
        const newItem = new Item({
            name,
            description,
            price,
            category,
            imageUrl: imageUrl || 'https://via.placeholder.com/150',
            stock
        });

        await newItem.save();

        res.status(201).json({
            success: true,
            message: 'Item created successfully',
            item: newItem
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error creating item',
            error: error.message
        });
    }
};

// Get all items with filtering and pagination
const getItems = async (req, res) => {
    try {
        const { 
            category, 
            minPrice, 
            maxPrice, 
            search, 
            page = 1, 
            limit = 10 
        } = req.query;

        // Build filter object
        let filter = {};
        
        if (category && category !== 'All') {
            filter.category = category;
        }
        
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }
        
        if (search) {
            filter.name = { $regex: search, $options: 'i' }; // Case-insensitive search
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Get items with filters and pagination
        const items = await Item.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        // Get total count for pagination info
        const totalItems = await Item.countDocuments(filter);
        const totalPages = Math.ceil(totalItems / parseInt(limit));
        
        res.status(200).json({
            success: true,
            items,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems,
                itemsPerPage: parseInt(limit),
                hasNext: parseInt(page) < totalPages,
                hasPrev: parseInt(page) > 1
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching items',
            error: error.message
        });
    }
};

// Get single item by ID
const getItem = async (req, res) => {
    try {
        const { id } = req.params;
        
        const item = await Item.findById(id);
        
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }
        
        res.status(200).json({
            success: true,
            item
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid item ID format'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error fetching item',
            error: error.message
        });
    }
};

// Update an item (Admin only)
const updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category, imageUrl, stock } = req.body;
        
        // Check if item exists
        const item = await Item.findById(id);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }
        
        // Check if name is being changed and if it conflicts with another item
        if (name && name !== item.name) {
            const existingItem = await Item.findOne({ name });
            if (existingItem) {
                return res.status(400).json({
                    success: false,
                    message: 'An item with this name already exists'
                });
            }
        }
        
        // Update fields
        if (name) item.name = name;
        if (description) item.description = description;
        if (price) item.price = price;
        if (category) item.category = category;
        if (imageUrl) item.imageUrl = imageUrl;
        if (stock !== undefined) item.stock = stock;
        
        await item.save();
        
        res.status(200).json({
            success: true,
            message: 'Item updated successfully',
            item
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid item ID format'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error updating item',
            error: error.message
        });
    }
};

// Delete an item (Admin only)
const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        
        const item = await Item.findByIdAndDelete(id);
        
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Item deleted successfully'
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid item ID format'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error deleting item',
            error: error.message
        });
    }
};

module.exports = {
    createItem,
    getItems,
    getItem,
    updateItem,
    deleteItem
};