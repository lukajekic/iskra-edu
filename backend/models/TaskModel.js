import mongoose from "mongoose";

const schema = new mongoose.Schema({
    title: String,
    richText: {
        type: String,
        required: false
    },

    language: String,
    outputType: String,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    folder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Folder",
        required: true
    },

    ownerRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    },

    published: Boolean,
    storeOriginID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
        required: false
    },
    
    tests: {
        type: [
            {
                input: Array,
                output: Array
            }
        ],

    required: false
    },

    grade: {
        type: String,
        required: false
    }
})


export const TaskModel = mongoose.model("Task", schema)