const User = require("../models/index.model").User;
const bcrypt = require("bcrypt");
const { StatusCodes } = require("http-status-codes");
const BaseResponse = require("../dto/baseResponse.dto");

exports.create = async (req, res) => {
  try {

    const users = await User.find({}, { firstName: 1, lastName: 1, email: 1, role: 1, password: 1 });
    const formattedUsers = users.map((user) => {
      return {
        name: user.email,
        department: user.role,
        password: user.password
      };
    });

    const user = new User({
      firstName: "req.body.firstName",
      lastName: "req.body.lastName",
      role:req.body.department,
      email: req.body.name,
      password: req.body.password,
    });
    const newUser = await user.save();
    res.status(StatusCodes.OK).send(formattedUsers);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(BaseResponse.error(res.statusCode, 'Kullanıcı eklenemedi', error.message));
  }
};

exports.login = async (req, res) => {
  try {
    
    const user = await User.findOne({ email: req.body.username,password:req.body.password });
    
    if (!user ) {
      let error = new Error("Incorrect Username or Password");
      res.status(StatusCodes.UNAUTHORIZED).send(BaseResponse.error(res.statusCode, 'Giriş Yapılamadı', error.message));
      return;
    }
    res.status(StatusCodes.OK).send(user);


  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(BaseResponse.error(res.statusCode, 'Giriş Yaparken Hata Oluştu', error.message));
  }
};


exports.getusers = async (req, res) => {
  try {

    const users = await User.find({}, { firstName: 1, lastName: 1, email: 1, role: 1, password: 1 });
    const formattedUsers = users.map((user) => {
      return {
        name: user.email,
        department: user.role,
        password: user.password
      };
    });
    res.status(StatusCodes.OK).send(formattedUsers);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(BaseResponse.error(res.statusCode, 'Kullanıcı getirilmedi', error.message));
  }
};