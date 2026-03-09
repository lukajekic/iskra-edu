import mongoose from "mongoose";

const schema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: false
    },

    read: Array,

    date: {
        type: Date,
        default: Date.now,
        required: true
    }
})

export const MessageModel = mongoose.model("Message", schema)