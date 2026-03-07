import mongoose from "mongoose";

const schema = new mongoose.Schema({
    title: String,
    teacherRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    open: Boolean
})

export const Foldermodel = mongoose.model("Folder", schema)