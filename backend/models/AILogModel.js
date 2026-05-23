import mongoose from "mongoose";

const schema = mongoose.Schema({
    taskID: String,
    task_description: String,
    code: String,
    ai_suggestion: String,
    metadata: {
        timestamp: Date,
        language: String,
        model: String
    },

    dataset_export: {
        type: Boolean,
        default: false
    }
})


export const AILogModel = mongoose.model("AILog", schema)