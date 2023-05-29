const mongoose = require("mongoose");
const { connectToMongoDb } = require("./db/mongoose.connection");
const Course = require("./models/index.model").Course;

const connectToMongoDb2 = async () => {
  try {
    await mongoose.connect("mongodb://0.0.0.0:27017/ytp", {
      compressors: "zlib",
      autoIndex: true,
      connectTimeoutMS: 5000,
    });
    console.log("DB Bağlandı");

    // Yeni bir dönem oluşturma
    // const newSemester = new Semester({
    //   name: "2022 Güz", // Dönemin adı
    //   courses: [], // İlk başta ders yok
    // });
    const newCourse = new Course({
        name: "Yeni Ders",
        semester: "646f557a30629ac2bfce5a85", // Dersin hangi döneme ait olduğunun referansı
        instructor: "646f49757efe2aa2a9ba97c7", // Dersin eğitmeninin kullanıcı kimlik referansı
        students: [], // İlk başta öğrenci yok
        pdf:[]
      });

    const newUser = await newCourse.save();
    console.log("Yeni dönem kaydedildi:", newUser);
  } catch (error) {
    console.log("error", error);
    throw new Error(error);
  }
};
connectToMongoDb2()
