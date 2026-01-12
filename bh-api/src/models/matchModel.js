import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
    stadium: { type: mongoose.Schema.Types.ObjectId, ref: 'Stadium' },
    date: { type: Date },
    opponent: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    season: { type: mongoose.Schema.Types.ObjectId, ref: 'Season', required: true },
    homeGame: { type: Boolean },
    matchLength: { type: Number, required: true, default: 36 }, // in minutes
    
    ourScore: { type: Number, required: true, default: 0 },
    opponentScore: { type: Number, required: true, default: 0 },
    // e.g., "Win", "Loss", "Draw", "Penalty Win", "Penalty Loss"
    result: { type: String, enum: ["Win", "Loss", "Draw", "Penalty Win", "Penalty Loss"], required: true },

    presentPlayers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
    goaliesMinutes: [{ 
        player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
        minutesPlayed: { type: Number, required: true, default: 36 }
    }],
}, { timestamps: true });

export default mongoose.model("Match", matchSchema);