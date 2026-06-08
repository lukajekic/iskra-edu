import mongoose from 'mongoose';
// PRIPAZIIT NA OVO
const schema = new mongoose.Schema({
    testID: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Test",
    },
    studentID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true 
    },

    startedAt: {
        type: Date,
        default: Date.now
    },

    submittedAt: {
        type: Date,
        required: false
    },

    status: {
        type: String,
        default: "assigned",
        enum: ['assigned', 'in-progress', 'submitted', 'graded']
    },
    answers: [{
        questionID: {
            type: mongoose.Schema.Types.ObjectId
        },
        questionType: {
            type: String
        },
        studentWork: {
            type: String,
            required: false
        },
        pointsEarned: {
            type: Number,
            required: false
        },
        status: {
            type: String,
            enum: ['graded', 'waiting', 'none'],
            default: 'none'
        },
        showCorrectnes: {
            type: Boolean,
            default: false
        }
    }],

    grade: {
        type: Number,
        required: false
    },
    teacherFeedback: {
        type: String,
        required: false
    }
}, { timestamps: true });

schema.index({ testID: 1, studentID: 1 }, { unique: true });

export const Submission = mongoose.model('Submission', schema);