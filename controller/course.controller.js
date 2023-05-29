const Course = require("../models/index.model").Course;
const User = require("../models/index.model").User;
const Semester = require("../models/index.model").Semester;
const fs = require("fs");

exports.upload = async (req, res) => {
  try {
    const courseId = req.body.courseId;
    const pdfId = req.file.buffer;
    const pdfname = req.file.originalname;
    const fileNameWithoutExtension = pdfname.split(".").slice(0, -1).join(".");

    const pdfData = {
      name: fileNameWithoutExtension,
      data: pdfId,
      contentType: req.file.mimetype,
    };
    const course = await Course.findById(courseId);

    if (!course) {
      const error = new Error("Ders bulunamadı");
      res.send(error);
    }

    course.pdf.push(pdfData);
    await course.save();

    res.send("File uploaded successfully.");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while uploading the file.");
  }
};

// exports.download = async (req, res) => {
//   try {

//     const courseId = req.body.courseId;
//     const course = await Course.findById(courseId);

//     if (!course) {
//       throw new Error("Ders bulunamadı");
//     }

//     const pdfs = course.pdf;

//     const pdfData = pdfs.map((pdf, index) => {
//       const fileName = `${pdf.name}_${index}.pdf`;
//       fs.writeFileSync(fileName, pdf.data);
//       return {
//         name: pdf.name,
//         data: fs.readFileSync(fileName).toString("base64"),
//       };
//     });

//     pdfs.forEach((pdf, index) => {
//       const fileName = `${pdf.name}_${index}.pdf`;
//       fs.unlinkSync(fileName);
//     });

//     console.log("PDF dosyaları oluşturuldu ve gönderildi.");

//     res.send(pdfData);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("An error occurred while uploading the file.");
//   }
// };

exports.download = async (req, res) => {
  try {
    // const instructorEmail = "2133123232342";
    console.log("first", req.body.instructorEmail);
    const instructorEmail = req.body.instructorEmail;
    // Instructor kullanıcısını email'e göre bul
    const instructor = await User.findOne({ email: instructorEmail }).populate(
      "courses"
    );

    if (!instructor) {
      const error = new Error("Kullanıcı bulunamadı");
      res.send(error);
    }

    const courses = instructor.courses;

    const pdfData = [];

    // Her bir kursun PDF'lerini base64 olarak dönüştür ve pdfData'ya ekle
    for (const course of courses) {
      if (!course.pdf || course.pdf.length === 0) {
        continue; // Eğer course.pdf boş ise, bu kursu atla ve bir sonraki kursa geç
      }

      for (const pdf of course.pdf) {
        const fileName = `${pdf.name}.pdf`;
        fs.writeFileSync(fileName, pdf.data);
        const data = fs.readFileSync(fileName).toString("base64");
        pdfData.push({
          courseId: course._id,
          courseName: course.name,
          courseNots: course.nots,
          pdfName: pdf.name,
          pdfData: data,
        });
        fs.unlinkSync(fileName);
      }
    }

    console.log("PDF dosyaları oluşturuldu ve gönderildi.");

    res.send(pdfData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Dosya gönderimi sırasında bir hata oluştu.");
  }
};

// function saveBufferToTextFile(data, filename) {
//     const bufferData = Buffer.from(data, "binary");
//     fs.writeFileSync(filename, bufferData);
// }

exports.getlessons = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate({
        path: "semester",
        select: "name",
      })
      .populate({
        path: "instructor",
        select: "email",
      })
      .populate({
        path: "students.student",
        select: "firstName lastName",
      })
      .select("-pdf"); // pdf alanını çekme

    res.send(courses);
  } catch (error) {
    console.error("Dersleri alırken bir hata oluştu:", error);
    res.status(500).send("Dersleri alırken bir hata oluştu");
  }
};

exports.getCourseWithId = async (req, res) => {
  const { courseId } = req.body;

  try {
    const course = await Course.findById(courseId)
      .populate("semester", "name")
      .populate("instructor", "firstName lastName")
      .populate("students.student", "firstName lastName");

    res.json(course);
  } catch (error) {
    console.error("Error getting course with ID:", error);
    res.status(500).json({ error: "Failed to get course" });
  }
};

exports.getStudentsByGrade = async (req, res) => {
  try {
    const courseId = req.body.courseId;
    const course = await Course.findById(courseId).populate("students.student");

    if (!course) {
      throw new Error("Ders bulunamadı");
    }

    const sortedStudents = course.students.sort((a, b) => {
      const aTotalGrade = calculateTotalGrade(a);
      const bTotalGrade = calculateTotalGrade(b);
      return bTotalGrade - aTotalGrade;
    });

    const firstStudent = sortedStudents[0];
    const lastStudent = sortedStudents[sortedStudents.length - 1];
    const middleStudentIndex = Math.floor(sortedStudents.length / 2);
    const middleStudent = sortedStudents[middleStudentIndex];

    console.log(firstStudent, lastStudent, middleStudent);

    res.send({ firstStudent, lastStudent, middleStudent });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching students by grade.");
  }
};

function calculateTotalGrade(student) {
  const { vize, final, ödev, proje, uygulama } = student;
  const totalGrade =
    (vize.not || 0) +
    (final.not || 0) +
    (ödev.not || 0) +
    (proje.not || 0) +
    (uygulama.not || 0);
  return totalGrade;
}

exports.addStudentCourse = async (req, res) => {
  try {
    const studentId = req.body.studentId;
    const courseId = req.body.courseId;
    const course = await Course.findById(courseId);
    const student = await User.findById(studentId);

    if (!course) {
      throw new Error("Ders bulunamadı");
    }

    if (!student) {
      throw new Error("Öğrenci bulunamadı");
    }

    const newStudent = {
      student: student._id,
      vize: {
        pdf: null,
        not: null,
      },
      final: {
        pdf: null,
        not: null,
      },
      ödev: {
        pdf: null,
        not: null,
      },
      proje: {
        pdf: null,
        not: null,
      },
      uygulama: {
        pdf: null,
        not: null,
      },
    };

    course.students.push(newStudent);
    student.courses.push(course._id);

    await Promise.all([course.save(), student.save()]);

    res.send("Student course added successfully.");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while adding student course.");
  }
};

exports.addInstructorCourse = async (req, res) => {
  try {
    const instructorId = req.body.instructorId;
    const courseId = req.body.courseId;
    const course = await Course.findById(courseId);
    const instructor = await User.findById(instructorId);

    if (!course) {
      return res.status(404).send("Course not found.");
    }

    if (!instructor) {
      return res.status(404).send("Instructor not found.");
    }

    course.instructor = instructor._id;
    instructor.courses.push(course._id);

    await Promise.all([course.save(), instructor.save()]);

    res.send("Instructor course added successfully.");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while adding instructor course.");
  }
};

exports.createCourse = async (req, res) => {
  try {
    // İstekten gerekli verileri alın
    const instructor = await User.findOne({ email: req.body.instructorEmail });

    const name = req.body.name;
    const semesterId = req.body.semesterId;

    // Yeni bir ders oluştur
    const course = new Course({
      name,
      semester: semesterId,
      instructor: instructor._id,
    });
    const semester = await Semester.findById(semesterId);
    semester.courses.push(course._id);
    instructor.courses.push(course._id);

    await Promise.all([course.save(), instructor.save(), semester.save()]);

    res.status(201).json({ message: "Ders başarıyla oluşturuldu", course });
  } catch (error) {
    console.error("Hata:", error);
    res.status(500).json({ error: "Ders oluşturulurken bir hata oluştu" });
  }
};

exports.getCourseByInstrcutor = async (req, res) => {
  try {
    const instructor = await User.findOne({
      email: req.body.instructorEmail,
    }).populate({
      path: "courses",
      populate: {
        path: "semester",
        select: "name",
      },
    });
    const courses = instructor.courses;

    res.send(courses);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.setCourseNots = async (req, res) => {
  try {
    const { grades, numbers } = req.body;

    const result = `${grades.vize}|${numbers.vizeSayisi}|${grades.final}|${numbers.finalSayisi}|${grades.uygulama}|${numbers.uygulamaSayisi}|${grades.proje}|${numbers.projeSayisi}|${grades.odev}|${numbers.odevSayisi}`;

    const courseId = req.body.courseId;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).send("Ders bulunamadı");
    }

    course.nots = result;
    await course.save();

    res.send("Notlar başarıyla güncellendi");
  } catch (error) {
    console.error(error);
    res.status(500).send("Not güncelleme hatası");
  }
};

exports.downloadById = async (req, res) => {
  try {
    console.log('req.body', req.body)
    console.log("first", req.body.courseId);
    const course = await Course.findById(req.body.courseId);

    if (!course) {
      const error = new Error("Kullanıcı bulunamadı");
      res.send(error);
    }

    const pdfData = [];

    // Her bir kursun PDF'lerini base64 olarak dönüştür ve pdfData'ya ekle

    for (const pdf of course.pdf) {
      const fileName = `${pdf.name}.pdf`;
      fs.writeFileSync(fileName, pdf.data);
      const data = fs.readFileSync(fileName).toString("base64");
      pdfData.push({
        courseId: course._id,
        courseName: course.name,
        courseNots: course.nots,
        pdfName: pdf.name,
        pdfData: data,
      });
      fs.unlinkSync(fileName);
    }

    console.log("PDF dosyaları oluşturuldu ve gönderildi.");

    res.send(pdfData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Dosya gönderimi sırasında bir hata oluştu.");
  }
};
