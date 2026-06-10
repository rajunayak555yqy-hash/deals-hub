require('dotenv').config();
console.log(process.env.MONGODB_URI);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'dealhub_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// Rate limiting
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
const chatLimiter = rateLimit({ windowMs: 1 * 60 * 1000, max: 20 });

app.use('/api/', apiLimiter);
app.use('/api/chatbot', chatLimiter);

// API routes
app.use('/api/deals', require('./routes/deals'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/chatbot', require('./routes/chatbot'));

 app.get('/check-admin', async (req, res) => {
const Admin = require('./models/Admin');
const admins = await Admin.find();
res.json(admins);
});

app.get('/reset-admin', async (req, res) => {
  const Admin = require('./models/Admin');

  await Admin.deleteMany({});

  const admin = new Admin({
    username: 'admin',
    password: 'Admin@123'
  });

  await admin.save();

  res.send('Admin reset successfully');
});

app.get('/create-admin', async (req, res) => {
  const Admin = require('./models/Admin');

  const admin = new Admin({
    username: 'admin',
    password: 'Admin@123'
  });

  await admin.save();
  res.send('Admin created');
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/frontend/index.html");
});

app.get("/admin/login", (req, res) => {
  res.sendFile(__dirname + "/frontend/admin/login.html");
});

app.get("/admin", (req, res) => {
  res.sendFile(__dirname + "/frontend/admin/dashboard.html");
});
// Static files
app.use(express.static(path.join(__dirname, 'frontend')));



// MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(()=>{
  console.log("✅ MongoDB connected");
  app.listen(PORT,()=>{
    console.log(`🚀 DealHub running at http://localhost:${PORT}`);
  });
})
.catch(err=>{
  console.log("MongoDB failed:",err.message);
  app.listen(PORT,()=>{
    console.log(`🚀 DealHub running at http://localhost:${PORT}`);
  });
});
