const jwt = require("jsonwebtoken");
require("dotenv").config();
const auth =(req,res,next)=>{
  const token = req.headers.authorization.split(" ")[1];
if(token){
    jwt.verify(token, process.env.JWTKEY, (err,decoded)=>{
        if(decoded){
           next()
        }else{
            res.status(400).send({"msg":"User is not logged In"})
        }
     })
}else{
    res.status(400).send({"msg":"User is not logged In"})
}
 
}

module.exports = auth