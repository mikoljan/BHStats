import mongoose from 'mongoose';

const penaltySchema = new mongoose.Schema({
    type: { type: String, required: true },
    // time of the event in seconds
    time: { type: Number, required: true, default: 0 },
    penaltyMinutes: { type: Number, required: true, default: 2 },
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
    // Indicate if the event is for our team
    ourTeam: { type: Boolean, required: true },
}, { timestamps: true });

export default mongoose.model("Penalty", penaltySchema);