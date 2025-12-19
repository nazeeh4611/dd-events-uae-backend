import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../Models/Admin.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const username = process.env.DEFAULT_ADMIN_USERNAME || 'admin';

    const adminExists = await Admin.findOne({ username });

    if (adminExists) {
      console.log('Admin already exists');
      process.exit(0);
    }

    const admin = new Admin({
      username,
      email:' Info@ddeventsuae.com',
      password: 'ddevents2025',
      role: 'superadmin',
      firstName: 'System',
      lastName: 'Administrator',
    });

    await admin.save();

    console.log('Admin created successfully');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedAdmin();
