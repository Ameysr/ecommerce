const mongoose = require('mongoose');
const { Schema } = mongoose;

const cartItemSchema = new Schema({
    item: {
        type: Schema.Types.ObjectId,
        ref: 'Item',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    }
});

const cartSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [cartItemSchema],
    total: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Calculate total before saving
cartSchema.pre('save', function(next) {
    this.total = this.items.reduce((total, item) => {
        return total + (item.item.price * item.quantity);
    }, 0);
    next();
});

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;