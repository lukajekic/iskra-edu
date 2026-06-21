import mongoose from "mongoose";

const schema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    lesson: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "Lesson"
    },

    answers: {
        type: Array,
        required: false
    },

    correct_answer: {
        type: String,
        required: false
    },

    owner: {
        type: mongoose.Types.ObjectId,
        required: true
    },

    description: {
        type: String,
        required: false
    }
},
{timestamps: true}
)

export const TheroyTAskModel = mongoose.model("TheoryTask", schema)