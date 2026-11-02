const mongoose = require('mongoose');

const ForgotPasswordTokenSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    token: { type: String, required: true },
    expiresIn: { type: Number, required: true },
}, { timestamps: true });

const ForgotPasswordToken = mongoose.models.ForgotPasswordToken || mongoose.model("ForgotPasswordToken", ForgotPasswordTokenSchema);
export default ForgotPasswordToken;
