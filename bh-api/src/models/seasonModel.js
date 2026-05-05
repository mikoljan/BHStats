import mongoose from 'mongoose';

const seasonSchema = new mongoose.Schema({
    year: { type: String, required: true },
    team: { type: String, enum: ['A', 'B', 'C'], required: true },
    matchLength: { type: Number, required: true, default: 36 },
    leagueLevel: { type: Number, required: true, default: 0 },
    leagueName: { type: String },
    position: { type: Number },
    movement: { type: String, enum: ['promotion', 'relegation', null], default: null },
    covidInterrupted: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("Season", seasonSchema);