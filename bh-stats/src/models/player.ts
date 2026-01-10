export interface Player {
  id: string;
  name: string;
  team: "A" | "B" | "C";
  position: "player" | "goalie";
}
