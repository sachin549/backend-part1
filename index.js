import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken'
import bcrypt from "bcrypt";


mongoose.connect("mongodb://127.0.0.1:27017",{
    dbName:"backend",
}).then(
    ()=>{console.log(" Database connected successfully")}
).catch((error)=>{
    console.log(error)
})


const userSchema= new mongoose.Schema({
    name:String,
    email: String,
    password:String
   
})

const User = new mongoose.model("user",userSchema);

 
const app = express()
import path from "path"
//import { nextTick } from 'process';

app.listen(6001,()=>{
    console.log("server is listening")
 
})
// const pathlocation= path.resolve();
// console.log(path.resolve())


//using middlewares
app.use(express.static(path.join(path.resolve(),"./public")));  // to use middle ware we use app.use //here we are using a static file public
app.use(express.urlencoded({ extended:true }));
app.use(cookieParser())
//setting up view engine
app.set("view engine", "ejs");


const isAuthenticated = async (req, res, next) => {
    const { token } = req.cookies;
    if (token) {
      const decoded = jwt.verify(token, "klahfsdhhakjads")
      req.user= await User.findById(decoded._id);
      next();
    } else {
      res.redirect("/login");
    }
  };

app.post("/register" , async (req,res)=>{
    const{name,email,password}=req.body

    let user = await User.findOne({email})

    if(user){
       return res.redirect("/login")
    }

    const hashedPassword= await bcrypt.hash(password,10)

     user= await User.create({
        name,
        email,
        password:hashedPassword
    })
    const token = jwt.sign({_id: user._id},"klahfsdhhakjads")
   // console.log(token)

     res.cookie("token", token,{
         expires: new Date(Date.now()+60*1000),
         httpOnly:true,
     })
     res.redirect("/");
})


app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
  
    if (!user) return res.redirect("/register");
  
    //const isMatch = await bcrypt.compare(password, user.password);
    let isMatch= await bcrypt.compare(password,user.password);
  
    if (!isMatch)
      return res.render("login", { email, message: "Incorrect Password" });
  
    const token = jwt.sign({ _id: user._id }, "klahfsdhhakjads");
  
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 60 * 1000),
    });
    res.redirect("/");
  });


app.get("/",isAuthenticated,(req,res)=>{  
   // console.log(req.user);
     res.render("logout.ejs",{name: req.user.name});  
})


app.get("/register",(req,res)=>{  
     res.render("register.ejs");
})

app.get("/login",(req,res)=>{
    res.render("login.ejs")
})



app.get("/logout",(req,res)=>{
    res.cookie("token", null ,{ httpOnly:true,  expires : new Date(Date.now()+60*1000)
    });
    
     res.render("login");
})





