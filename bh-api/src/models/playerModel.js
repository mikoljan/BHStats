import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    number: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model("Player", playerSchema);