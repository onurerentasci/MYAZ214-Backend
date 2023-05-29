const express = require("express");
const cors = require('cors');
const router = require('./router/index');

const app = express();
app.use(cors())
app.use(express.json());

app.use('/hello', (req,res) => {
  res.send('Backend çalışıyor')
})


app.use('/user', router.userRouter.userRouter)
app.use('/course', router.courseRouter.courseRouter)

const db = require('./db/mongoose.connection');
db.connectToMongoDb()




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
