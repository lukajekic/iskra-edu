import mongoose from "mongoose";

const schema = new mongoose.Schema({
    title: String,
    richText: String,
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

    tests: {
        type: [
            {
                input: Array,
                output: Array
            }
        ],

    required: false
    }
})


export const TaskModel = mongoose.model("Task", schema)