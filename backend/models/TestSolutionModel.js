import mongoose from "mongoose";

const solutionSchema = new mongoose.Schema({
    test_ref: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
        required: true
    },
    student_ref: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    submission_status: {
        type: String,
        enum: ['assigned', 'in_progress', 'submitted', 'graded'],
        default: 'assigned'
    },
    answers: [
        {
            question_id: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },
            task_type: { 
                type: String, 
                required: true,
                enum: ['Task', 'TheoryTask']
            },
           
            student_answer: {
                type: mongoose.Schema.Types.Mixed, // Fleksibilno za tekst, kod ili JSON strukturu
                default: null
            },
            points_awarded: {
                type: Number,
                default: 0
            },
            max_points: {
                type: Number
            },
            feedback: {
                type: String,
                default: ''
            },
            status: {
                type: String,
                enum: ['none', 'incorrect', 'correct', 'grading'],
                default: 'none'
            }
        }
    ],
    total_points_awarded: {
        type: Number,
        default: 0
    },
    total_points_possible: {
        type: Number,
        default: 0
    },
    grade_value: {
        type: Number,
        default: null
    },
    started_at: {
        type: Date,
        default: Date.now
    },
    submitted_at: Date,

    action_required: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

solutionSchema.index({ test_ref: 1, student_ref: 1 }, { unique: true });

export const SolutionModel = mongoose.model('Solution', solutionSchema);