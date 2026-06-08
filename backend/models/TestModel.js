import mongoose from 'mongoose'; 

const schema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    grade: {
        type: String,
        required: true
    },
    classes: {
        type: String,
        required: false
    },
    active: Boolean,
    questions: [
        {
            taskType: { 
                type: String, 
                required: true,
                enum: ['Task', 'TheoryTask']
            },
            questionID: { 
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },
            points_max: Number
        }
    ],
    scale: Object,
    settings: {
        disableEdits: {
            type: Boolean,
            default: false
        }
    }
}, { timestamps: true });

// Za svaki slucaj proveriti da li se struktura poklapa sa odlukom o obradi podataka (4. jun 2026.)

export const TestModel = mongoose.model('Test', schema);