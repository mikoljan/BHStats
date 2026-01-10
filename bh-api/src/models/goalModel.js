import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
    type: { type: String, required: true },
    // time of the event in seconds
    time: { type: Number, required: true, default: 0 },
    scorer: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    assist: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
    // Indicate if the event is for our team
    ourTeam: { type: Boolean, required: true },
    winningGoal: { type: Boolean, default: false },
    equalizingGoal: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("Goal", goalSchema);