const express =  require("express");
const { connection } = require("./server.js");
const userRouter = require("./routes/userRoute");
// const blogRouter = require("./routes/blogRoute");
var cors = require('cors');
// const contentCreatorRouter = require("./routes/contentCreatorRoute");
require("dotenv").config()

const app = express();

app.use(express.json());
app.use(cors());


app.use("/user",userRouter);
// app.use("/blogs",blogRouter);
// app.use("/content",contentCreatorRouter)

app.get("/",(req,res)=>{
res.send('"/blog" : for blog routes , "/users" : for user route , "/content" : for content generation')
})


app.listen(process.env.PORT,async()=>{
    try {
        console.log(`server is running at ${process.env.PORT}`)
        await connection;
        console.log("db is connected");
    } catch (error) {
        console.log(error)
    }
  
})
