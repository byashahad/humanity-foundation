import mongoose from "mongoose";
const HeroSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    media: [{
        url: {
            type: String,
            required: true
        },
        publicID: {
            type: String,
            required: true
        }
    }]
})

export default mongoose.models.Hero || mongoose.model("Hero", HeroSchema)