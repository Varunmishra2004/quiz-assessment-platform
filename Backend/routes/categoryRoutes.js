const express = require("express");
const router = express.Router();

const {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory
} = require("../controller/categoryController");

const authMiddleware = require("../middleware/authmiddleware");
const { adminMiddleware } = require("../middleware/roleMiddleware");


// GET ALL CATEGORIES
router.get(
    "/",
    authMiddleware,
    adminMiddleware,
    getAllCategories
);


// CREATE CATEGORY
router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    createCategory
);


// UPDATE CATEGORY
router.put(
    "/:id",
    authMiddleware,
    adminMiddleware,
    updateCategory
);


// DELETE CATEGORY
router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    deleteCategory
);


module.exports = router;