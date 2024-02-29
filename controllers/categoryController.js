const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

const Category = require("../models/category");
const Item = require("../models/item");

// Display list of all Category.
exports.category_list = asyncHandler(async (req, res, next) => {
  const allCategory = await Category.find().sort({ name: 1 }).exec();
  res.render("category_list", {
    title: "Category List",
    category_list: allCategory,
  });
});

// Display detail page for a specific Category.
exports.category_detail = asyncHandler(async (req, res, next) => {
  // Get details of category and all associated items (in parallel)
  const [category, itemsInCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find(
      { category: { $elemMatch: { $eq: req.params.id } } },
      "name description"
    ).exec(),
  ]);

  if (category === null) {
    // No results.
    const err = new Error("Category not found");
    err.status = 404;
    return next(err);
  }

  res.render("category_detail", {
    title: "Category Detail",
    category: category,
    category_items: itemsInCategory,
  });
});

// Display Category create form on GET.
exports.category_create_get = (req, res, next) => {
  res.render("category_form", {
    title: "Create Category",
  });
};

// Handle Category create on POST.
exports.category_create_post = [
  // Validate and sanitize fields.
  body("name", "Name must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("description", "Invalid description")
    .optional({ values: "falsy" })
    .trim()
    .escape(),
  // Process request after validation and sanitization.

  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create an Item object with escaped and trimmed data.
    const category = new Category({
      name: req.body.name,
      description: req.body.description,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      res.render("category_form", {
        title: "Create Category",
        category: category,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Save Category.
      await category.save();
      res.redirect(category.url);
    }
  }),
];

// Display Category delete form on GET.
exports.category_delete_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Category delete GET");
});

// Handle Category delete on POST.
exports.category_delete_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Category delete POST");
});

// Display Category update form on GET.
exports.category_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Category update GET");
});

// Handle Category update on POST.
exports.category_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Category update POST");
});
