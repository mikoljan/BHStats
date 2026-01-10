import Player from "../models/playerModel.js";

export async function getPlayers(req, res) {
  try {
    const players = await Player.find();
    res.status(200).json(players);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch players" });
  }
}