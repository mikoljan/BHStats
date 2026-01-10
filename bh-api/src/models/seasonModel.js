import mongoose from 'mongoose';

const seasonSchema = new mongoose.Schema({
    year: { type: Number },
    team: { type: String, enum: ['A', 'B', 'C'], required: true },
    leagueLevel: { type: Number, required: true },
    leagueName: { type: String },
    position: { type: Number },
    covidInterrupted: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("Season", seasonSchema);