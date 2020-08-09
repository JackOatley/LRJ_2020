import { Sprite, spriteSheet } from 'Sprite';

export const CREATURE = {
	IMP: {
		name: "Imp",
		sprite: new Sprite(spriteSheet, [
			[9*8, 6*8, 8, 8],
			[10*8, 6*8, 8, 8],
			[11*8, 6*8, 8, 8],
			[10*8, 6*8, 8, 8]
		]),
		hp: 4,
		canDig: true
	},
	GOBLIN: {
		name: "Goblin",
		sprite: new Sprite(spriteSheet, [
			[11*8, 5*8, 8, 8]
		]),
		hp: 16,
		canDig: false
	}
}
