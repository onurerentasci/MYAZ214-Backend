const express = require("express");
const router = express.Router();
const controller = require("../controller/course.controller")
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/upload", upload.single('buffer'),controller.upload);
router.post("/getstudents",controller.getStudentsByGrade);
router.post("/addstudents",controller.addStudentCourse);
router.post("/addinstructor",controller.addInstructorCourse);
router.post("/createcourse",controller.createCourse);
router.post("/download",controller.download);
router.post("/getcoursebyinst",controller.getCourseByInstrcutor);
router.get("/getlessons",controller.getlessons);
router.post("/setnotes",controller.setCourseNots);
router.post("/getCoursespdf",controller.downloadById);


module.exports = {
  courseRouter: router,
};
