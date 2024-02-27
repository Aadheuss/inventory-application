#! /usr/bin/env node

console.log(
  'This script populates some test items and categories to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority"'
);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const Item = require("./models/item");
const Category = require("./models/category");

const items = [];
const categories = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const mongoDB = userArgs[0];

async function main() {
  console.log("Debug: About to connect");

  await mongoose.connect(mongoDB);

  console.log("Debug: Should be connected?");

  await createCategories();
  await createItems();

  console.log("Debug: Closing mongoose");

  mongoose.connection.close();
}

main().catch((err) => console.log(err));

// We pass the index to the ...Create functions so that, for example,
// items[0] will always be the specified item, regardless of the order
// in which the elements of promise.all's argument complete.

async function itemCreate(index, name, description, category, price, stock) {
  const itemDetail = { name, price, stock };
  if (description !== false) itemDetail.description = description;
  if (category != false) itemDetail.category = category;

  const item = new Item(itemDetail);
  await item.save();
  items[index] = item;
  console.log(`Added Item: ${name}`);
}

async function categoryCreate(index, name, description) {
  const categoryDetail = { name };
  if (description !== false) categoryDetail.description = description;

  const category = new Category(categoryDetail);
  await category.save();
  categories[index] = category;
  console.log(`Added Category: ${name}`);
}

async function createCategories() {
  console.log("Adding Categories");

  await Promise.all([
    categoryCreate(
      0,
      "Men's Fashion",
      "The most sustainable of men's fashion. stylish and modern"
    ),
    categoryCreate(
      1,
      "Women's Fashion",
      "Where elegance meets sustainability is your priority"
    ),
  ]);
}

async function createItems() {
  console.log("Adding Items");

  await Promise.all([
    itemCreate(
      0,
      "Striped Jacket",
      "Comfortable, modern jacket",
      [categories[0]],
      99,
      6
    ),
    itemCreate(
      1,
      "Mermaid's scale dress",
      "Modern, high-fashion dress",
      [categories[1]],
      679,
      3
    ),
    itemCreate(
      2,
      "Pineapple dream t-shirt",
      "Casual, fun t-shirt",
      [categories[0]],
      29.99,
      60
    ),
  ]);
}
