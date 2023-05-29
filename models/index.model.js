const mongoose = require("mongoose");

// Kullanıcı şeması
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["departmentCoordinator", "instructor", "mudekAuditor", "student"],
    required: true,
  },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
});

// Dönem şeması
const semesterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
});

// Ders şeması
const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  semester: { type: mongoose.Schema.Types.ObjectId, ref: "Semester" },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  pdf: [{
    name :{type :String},
    data: { type: Buffer, required: false },
    contentType: { type: String, required: false }
  }],
  nots : {type :String}, 
  students: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      vize: {
        pdf: { type: String },
        not: { type: Number, min: 0, max: 100 },
      },
      final: {
        pdf: { type: String },
        not: { type: Number, min: 0, max: 100 },
      },
      ödev: {
        pdf: { type: String },
        not: { type: Number, min: 0, max: 100 },
      },
      proje: {
        pdf: { type: String },
        not: { type: Number, min: 0, max: 100 },
      },
      uygulama: {
        pdf: { type: String },
        not: { type: Number, min: 0, max: 100 },
      },
    },
  ],
});

const User = mongoose.model("User", userSchema, "User");
const Semester = mongoose.model("Semester", semesterSchema, "Semester");
const Course = mongoose.model("Course", courseSchema, "Course");

module.exports = { User, Semester, Course };
