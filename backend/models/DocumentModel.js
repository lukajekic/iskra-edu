import mongoose from "mongoose";


const schema = new mongoose.Schema({
    title: String,
    link: String
})

export const DocumentModel = mongoose.model("Document", schema)