const mongoose = require('mongoose');
require('dotenv').config();

const Admin = require('./models/Admin');

mongoose.connect(process.env.MONGODB_URI)
.then(async () => {

  const existing = await Admin.findOne({ username: 'admin' });

  if (existing) {
    console.log('Admin already exists');
    process.exit();
  }

  const admin = new Admin({
    username: 'admin',
    password: 'Admin@123'
  });

  await admin.save();

  console.log('✅ Admin created successfully');
  process.exit();

})
.catch(err => {
  console.log(err);
});