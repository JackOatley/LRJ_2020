export interface TileInterface {
	name: string;
	hasFaces?: boolean;
	isHigh?: boolean;
	minable?: boolean;
}

export const TILE = {
	NULL: { name: "NULL" },
	SPECIAL: { name: "SPECIAL" },
	GROUND: { name: "Ground" },
	FLOOR: { name: "Claimed Ground" },
	WALL: { name: "Wall", hasFaces: true, isHigh: true, minable: true },
	LAIR: { name: "Lair" },
	HATCHERY: { name: "Hatchery" },
	BEDROCK: { name: "Bedrock", hasFaces: true, isHigh: true },
	DIRT: { name: "Dirt", hasFaces: true, isHigh: true, minable: true },
	GOLD: { name: "Gold", hasFaces: true, isHigh: true, minable: true }
}
