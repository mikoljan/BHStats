import Goal from "../models/goalModel.js";
import Match from "../models/matchModel.js";
import Penalty from "../models/penaltyModel.js";
import Player from "../models/playerModel.js";
import Season from "../models/seasonModel.js";
import Stadium from "../models/stadiumModel.js";
import Team from "../models/teamModel.js";

// Deletes every stored entity so the database can be reset quickly.
export async function deleteAllData(req, res) {
	try {
		const [goals, penalties, matches, players, seasons, stadiums, teams] = await Promise.all([
			Goal.deleteMany({}),
			Penalty.deleteMany({}),
			Match.deleteMany({}),
			Player.deleteMany({}),
			Season.deleteMany({}),
			Stadium.deleteMany({}),
			Team.deleteMany({}),
		]);

		res.status(200).json({
			message: "All data deleted successfully",
			deleted: {
				goals: goals.deletedCount,
				penalties: penalties.deletedCount,
				matches: matches.deletedCount,
				players: players.deletedCount,
				seasons: seasons.deletedCount,
				stadiums: stadiums.deletedCount,
				teams: teams.deletedCount,
			},
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Failed to delete all data" });
	}
}
