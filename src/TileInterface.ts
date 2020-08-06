export interface TileInterface {
	name: string;
	hasFaces?: boolean;
	isHigh?: boolean;
	minable?: boolean;
}

export const TILE = {
	NULL: { name: "NULL", isHigh: true },
	SPECIAL: { name: "SPECIAL" },
	GROUND: { name: "Ground" },
	FLOOR: { name: "Claimed Ground" },
	LAIR: { name: "Lair" },
	HATCHERY: { name: "Hatchery " },
	BEDROCK: { name: "Bedrock", hasFaces: true, isHigh: true },
	DIRT: { name: "Dirt", hasFaces: true, isHigh: true, minable: true },
	GOLD: { name: "Gold", hasFaces: true, isHigh: true, minable: true }
}
