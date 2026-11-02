const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: mongoose.Schema.Types.Mixed, required: true },
    className: { type: String, required: true, trim: true },
    division: { type: String, required: true, trim: true, uppercase: true },
    rollNumber: { type: Number, required: true },
    genRegNumber: { type: Number, required: true },
    DOB: { type: Date, required: true },
    caste: { type: String, required: true, trim: true },
    subCaste: { type: String, required: true, trim: true }
}, { timestamps: true });

// Prevent duplicate roll numbers in the same class and division
StudentSchema.index({ className: 1, division: 1, rollNumber: 1 }, { unique: true });
StudentSchema.index({ className: 1, division: 1 });

const Student = mongoose.models.Student || mongoose.model("Student", StudentSchema);
export default Student;
