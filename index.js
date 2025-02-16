require("dotenv").config(); // Load environment variables

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const session = require("express-session");

const app = express();
app.use(express.json());

// ✅ CORS Configuration 
app.use(
  cors({
    origin: ["https://i-genecommercefrontend.onrender.com"], // ✅ Replace with your frontend URL
    credentials: true, 
  })
);

// ✅ Express Session Setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || "defaultSecretKey", 
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production", // 🔹 Secure cookies in production
      httpOnly: true,
      sameSite: "none",
      maxAge: 3600000,
    },
  })
);

// ✅ Connect to MongoDB (Render Database URL)
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ MONGO_URI is missing in .env file");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

// ✅ User Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model("User", UserSchema);

// ✅ Middleware for Authentication
const checkLogin = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Please log in first" });
  }
  next();
};

// ✅ Login API
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    req.session.user = { username: user.username, email: user.email };
    res.json({ message: "Login successful", username: user.username });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Error logging in" });
  }
});

// ✅ Check Login API
app.get("/checkLogin", checkLogin, (req, res) => {
  res.status(200).json({ message: "User is logged in" });
});

// ✅ Logout API
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: "Error logging out" });
    res.json({ message: "Logged out successfully" });
  });
});

// ===============================
// ✅ PRODUCT MANAGEMENT API
// ===============================

// ✅ Product Schema
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
});
const Product = mongoose.model("Product", ProductSchema);

// ✅ Get All Products
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products" });
  }
});

// ✅ Add a Product
app.post("/products", async (req, res) => {
  try {
    const { name, price, description } = req.body;
    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    const newProduct = new Product({ name, price, description });
    await newProduct.save();
    res.status(201).json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    res.status(500).json({ message: "Error adding product" });
  }
});

// ✅ Update Product by ID
app.put("/products/:id", async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price, description },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: "Error updating product" });
  }
});

// ✅ Delete All Products
app.delete("/products", async (req, res) => {
  try {
    await Product.deleteMany({});
    res.json({ message: "All products deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting products" });
  }
});

// ✅ Delete Product by ID
app.delete("/products/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product" });
  }
});

// ✅ Default Route
app.get("/", (req, res) => {
  res.send("Welcome to the E-Commerce API! 🎉");
});

// ✅ Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
