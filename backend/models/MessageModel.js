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
    },

    target: {
        type: String,
        required: false,
        default: null
    }
})

export const MessageModel = mongoose.model("Message", schema)