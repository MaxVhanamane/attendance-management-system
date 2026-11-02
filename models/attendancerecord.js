const mongoose = require('mongoose');

const AttendanceRecordSchema = new mongoose.Schema({
    name: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    email: { type: String, required: true },
    phone: { type: mongoose.Schema.Types.Mixed, required: true },
    className: { type: String, required: true },
    division: { type: String, required: true },
    rollNumber: { type: Number, required: true },
    attendance: { type: String, required: true, enum: ['P', 'A', 'NT'] },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    genRegNumber: { type: Number, required: true },
    DOB: { type: Date, required: true },
    caste: { type: String, required: true },
    subCaste: { type: String, required: true }
}, { timestamps: true });

// Optimize date-range and student attendance queries
AttendanceRecordSchema.index({ className: 1, division: 1, date: 1 });
AttendanceRecordSchema.index({ name: 1, date: 1 });

const AttendanceRecord = mongoose.models.AttendanceRecord || mongoose.model("AttendanceRecord", AttendanceRecordSchema);
export default AttendanceRecord;
