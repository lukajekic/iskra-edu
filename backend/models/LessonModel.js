import mongoose from "mongoose"

const schema = new mongoose.Schema({
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },

    title: {
        type: String,
        required: true
    },

    grade: {
        type: String,
        required: true
    }
}, {timestamps: true})

export const LessonModel = mongoose.model("Lesson", schema)