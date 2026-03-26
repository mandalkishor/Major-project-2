 const express = require("express");
const cors = require("cors");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

// ===== Cloudinary Config =====
cloudinary.config({
  cloud_name: "demo", // replace later
  api_key: "123456",
  api_secret: "abcdef"
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

// ===== Fake DB (in-memory for demo) =====
let users = [];
let complaints = [];

// ===== FRONTEND HTML =====
app.get("/", (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <title>Smart City</title>
    <style>
      body {
        font-family: Arial;
        background: linear-gradient(135deg,#667eea,#764ba2);
        display:flex;
        justify-content:center;
        align-items:center;
        height:100vh;
        margin:0;
      }
      .box {
        background:white;
        padding:20px;
        border-radius:10px;
        width:320px;
      }
      input,textarea {
        width:100%;
        margin:5px 0;
        padding:8px;
      }
      button {
        width:100%;
        padding:10px;
        margin-top:5px;
        background:#667eea;
        color:white;
        border:none;
        cursor:pointer;
      }
    </style>
  </head>
  <body>

  <div class="box">
    <h2>Smart City</h2>

    <input id="email" placeholder="Email">
    <input id="password" type="password" placeholder="Password">

    <button onclick="register()">Register</button>
    <button onclick="login()">Login</button>

    <hr>

    <h3>Complaint</h3>
    <input id="title" placeholder="Title">
    <textarea id="desc"></textarea>
    <input type="file" id="image">

    <button onclick="submitComplaint()">Submit</button>

    <h3>All Complaints</h3>
    <ul id="list"></ul>
  </div>

<script>
let token = "";

// ===== AUTH =====
async function register(){
  await fetch('/register',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      email:email.value,
      password:password.value
    })
  });
  alert("Registered");
}

async function login(){
  let res = await fetch('/login',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      email:email.value,
      password:password.value
    })
  });
  let data = await res.json();
  token = data.token;
  alert("Logged in");
}

// ===== IMAGE UPLOAD =====
async function uploadImage(){
  let file = document.getElementById("image").files[0];
  let formData = new FormData();
  formData.append("image", file);

  let res = await fetch('/upload',{
    method:'POST',
    body:formData
  });
  let data = await res.json();
  return data.url;
}

// ===== COMPLAINT =====
async function submitComplaint(){
  let imgUrl = "";
  if(image.files[0]){
    imgUrl = await uploadImage();
  }

  await fetch('/complaint',{
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'Authorization':token
    },
    body:JSON.stringify({
      title:title.value,
      desc:desc.value,
      image:imgUrl,
      location:"Auto-detect (Demo)"
    })
  });

  alert("Submitted");
  loadComplaints();
}

// ===== LOAD =====
async function loadComplaints(){
  let res = await fetch('/all');
  let data = await res.json();

  let list = document.getElementById("list");
  list.innerHTML="";

  data.forEach(c=>{
    list.innerHTML += \`
      <li>
        <b>\${c.title}</b><br>
        \${c.desc}<br>
        <img src="\${c.image}" width="100"><br>
        Status: \${c.status}
      </li>
    \`;
  });
}

loadComplaints();
</script>

  </body>
  </html>
  `);
});

// ===== BACKEND =====

// Register
app.post("/register", async (req,res)=>{
  let hash = await bcrypt.hash(req.body.password,10);
  users.push({email:req.body.email,password:hash});
  res.send("OK");
});

// Login
app.post("/login", async (req,res)=>{
  let user = users.find(u=>u.email===req.body.email);
  if(!user) return res.send("No user");

  let valid = await bcrypt.compare(req.body.password,user.password);
  if(!valid) return res.send("Wrong");

  let token = jwt.sign({email:user.email},"secret");
  res.json({token});
});

// Upload
app.post("/upload", upload.single("image"), async (req,res)=>{
  cloudinary.uploader.upload_stream(
    {resource_type:"image"},
    (err,result)=>{
      res.json({url:result.secure_url});
    }
  ).end(req.file.buffer);
});

// Auth Middleware
function auth(req,res,next){
  let token = req.headers.authorization;
  let data = jwt.verify(token,"secret");
  req.user = data;
  next();
}

// Complaint
app.post("/complaint", auth, (req,res)=>{
  complaints.push({
    id:Date.now(),
    ...req.body,
    status:"Pending"
  });
  res.send("Added");
});

// Get all
app.get("/all",(req,res)=>{
  res.json(complaints);
});

// ===== START =====
app.listen(5000,()=>console.log("Running on 5000"));