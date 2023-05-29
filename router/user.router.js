const express = require("express");
const router = express.Router();
const controller = require("../controller/user.controller");

router.post("/create", controller.create);
router.post("/login", controller.login);
router.get("/getusers", controller.getusers);

module.exports = {
  userRouter: router,
};


