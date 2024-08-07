const mongoose = require("mongoose");
const Restaurant = require("../models/restaurantModel");
const Table = require("../models/tableModel");

const updateRestaurantCapacity = async (restaurantID) => {
  const restaurant = await Restaurant.findById(restaurantID).populate({
    path: "tableList",
    populate: {
      path: "orders.currentOrder",
      match: { "orders.status": { $ne: "completed" } }
    }
  });

  if (!restaurant) {
    throw new Error("Restaurant not found");
  }

  const totalCapacity = restaurant.tableList.length;
  let customerCount = 0;

  for (const table of restaurant.tableList) {
    const activeOrders = table.orders.filter(order => order.status !== "completed");
    customerCount += activeOrders.length;
  }

  restaurant.totalCapacity = totalCapacity;
  restaurant.customerCount = customerCount;
  await restaurant.save();
  console.log("Updated restaurant:", restaurant);
};

exports.getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find().populate({
      path: "tableList",
      populate: {
        path: "orders.currentOrder",
        match: { "orders.status": { $ne: "completed" } }
      }
    });

    if (restaurants.length !== 0) {
      await Promise.all(restaurants.map(restaurant => updateRestaurantCapacity(restaurant._id)));
      return res.status(200).json({ status: "success", data: restaurants });
    }

    return res.status(404).json({ status: "failed", message: "No restaurant found" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.updateRestaurantMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const { menu } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(401).json({
        status: "failed",
        message: "Invalid restaurant ID",
      });
    }
    const restaurant = await Restaurant.findById
    (id).populate("menu");
    if (!restaurant) {
      return res.status(404).json({
        status: "failed",
        message: "Restaurant not found",
      });
    }
    restaurant.menu = menu;
    await restaurant.save();
    res.status(200).json({
      status: "success",
      data: restaurant.menu,

    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.getRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(401).json({
        status: "failed",
        message: "Invalid restaurant ID",
      });
    }
    const restaurant = await Restaurant.findById(id);
    if (restaurant.length === 0) {
      return res.status(404).json({
        status: "failed",
        message: "Restaurant not found",
      });
    }
    res.status(200).json({
      status: "success",
      data: restaurant,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
exports.createRestaurant = async (req, res) => {
  try {
    const restaurant = req.body;
    console.log(restaurant);
    const newRestaurant = await Restaurant.create(restaurant);
    res.status(201).json({
      status: "success",
      data: newRestaurant,
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};
exports.updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(401).json({
        status: "failed",
        message: "Invalid restaurant ID",
      });
    }
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      id,
      { ...restaurant, _id: id },
      { new: true }
    );
    res.status(200).json({
      status: "success",
      data: updatedRestaurant,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
exports.deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(401).json({
        status: "failed",
        message: "Invalid restaurant ID",
      });
    }
    await Restaurant.findByIdAndRemove(id);
    res.status(200).json({
      status: "success",
      message: "Restaurant deleted successfully",
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
exports.getRestaurantMenu = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(401).json({
        status: "failed",
        message: "Invalid restaurant ID",
      });
    }
    const restaurant = await Restaurant.findById(id).populate("menu");
    if (!restaurant) {
      return res.status(404).json({
        status: "failed",
        message: "Restaurant not found",
      });
    }
    res.status(200).json({
      status: "success",
      data: restaurant.menu,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
exports.getRestaurantStaff = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(401).json({
        status: "failed",
        message: "Invalid restaurant ID",
      });
    }
    const restaurant = await Restaurant.findById(id).populate("staffList");
    if (!restaurant) {
      return res.status(404).json({
        status: "failed",
        message: "Restaurant not found",
      });
    }
    res.status(200).json({
      status: "success",
      data: restaurant.staffList,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
exports.getRestaurantTables = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(401).json({
        status: "failed",
        message: "Invalid restaurant ID",
      });
    }
    const restaurant = await Restaurant.findById(id).populate("tableList");
    if (!restaurant) {
      return res.status(404).json({
        status: "failed",
        message: "Restaurant not found",
      });
    }
    res.status(200).json({
      status: "success",
      data: restaurant.tableList,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
exports.getRestaurantOrders = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(401).json({
        status: "failed",
        message: "Invalid restaurant ID",
      });
    }
    const restaurant = await Restaurant.findById(id).populate("orders");
    if (!restaurant) {
      return res.status(404).json({
        status: "failed",
        message: "Restaurant not found",
      });
    }
    res.status(200).json({
      status: "success",
      data: restaurant.orders,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.deleteAllRestaurants = async (req, res) => {
  try {
    await Restaurant.deleteMany();
    res.status(200).json({
      status: "success",
      message: "All restaurants deleted successfully",
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Path: controllers/restaurantController.js
