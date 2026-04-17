import mongoose from "mongoose";

const schema = new mongoose.Schema({
    name: String,
    type: String,
    username: String,
    password: String,
    activegroup: {
    type: {
        expiry: Date,
        code: String,
        work_forbidden: Boolean
    },
    default: undefined,
    required: false,

},

    institution: {
        type: String,
        required: false
    },

    teacherRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    },

    userExpiry: {
        type: Date,
        required: false
    },

    groupCodeRef: String,

    solutions: {
        type: [{
            solutionID: String,
            status: String,
            code: String,
            stderr: String,
            taskID: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Task"
            },

            dev_ocekivani_output: {
                type: String,
                required: false
            },
    dev_output: {
        type: String,
        required: false
    },

    grading_date: {
        type: Date,
        required: false
    }
        }],
        default: undefined,
        required: false
    }


}, {
    timestamps: true
})


export const UserModel = mongoose.model("User", schema)

