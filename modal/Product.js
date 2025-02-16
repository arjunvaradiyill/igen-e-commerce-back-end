const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function (value) {
        return /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))$/.test(value);
      },
      message: "Invalid image URL. URL must end with png, jpg, jpeg, gif, or svg."
    }
  },
  category: {
    type: String,
    default: "General"
  }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
