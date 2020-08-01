export interface TileInterface {
	name: string;
	hasFaces?: boolean;
	isHigh?: boolean;
	minable?: boolean;
}

export const TILE = {
	NULL: { name: "NULL" },
	GROUND: { name: "Ground",},
	BEDROCK: { name: "Bedrock", hasFaces: true, isHigh: true },
	DIRT: { name: "Dirt", hasFaces: true, isHigh: true, minable: true },
	GOLD: { name: "Gold", hasFaces: true, isHigh: true, minable: true }
}
