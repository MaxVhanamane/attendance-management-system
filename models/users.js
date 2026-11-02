const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['admin', 'teacher'], default: 'teacher', lowercase: true, trim: true },
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
}, { timestamps: true });

// Prevent model overwrite in Next.js hot reload
const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
