import { Array2D } from './Array2D';
import { keyboard, mouse } from './Input';
import { Texture } from './Texture';
import { Tile } from './Tile';
import { TILE, TileInterface } from './TileInterface';
import { Sprite, spriteSheet } from './Sprite';
import { Map, LoadMapCallbackArgs } from './Map';
import { Mob } from './Mob';
import { Sound } from 'Sound';

let overGUI = false;
let building = false;
let buildingType;
let topText = "";
let displayText = "";
let cursorIndex = 1;

// load musicdungeon_ambient_1
const musBackground = new Sound("./data/music/ambient.mp3");
const musAmbient2 = new Sound("./data/music/dungeon_ambient_1.ogg");
setTimeout(() => {
	musBackground.play(true);
	musAmbient2.play(true);
},
1000);
/*
const interval = setInterval(() => {
	musBackground.play();
	if (!musBackground.paused) {
		musBackground.loop = true;
		clearInterval(interval);ss
	}
}, 100);
*/

// load sfx
const sfxDig = new Sound("./data/sfx/dig.wav", 10, 0.5);

//const font = [
	//new Sprite(spriteSheet, [[15*8, 2*8, 8, 8]])
//]
const icons = [
	new Sprite(spriteSheet, [[11*8, 2*8, 8, 8]]),	// blank
	new Sprite(spriteSheet, [[0*8, 12*8, 8, 8]]),	// lair
	new Sprite(spriteSheet, [[1*8, 12*8, 8, 8]]),	// hatchery
];
const cursor = new Sprite(spriteSheet, [
	[7*8, 7*8, 8, 8],		// trident
	[7*8, 8*8, 8, 8],		// pickaxe
	[7*8, 9*8, 8, 8]		// building
]);
const lair = new Sprite(spriteSheet, [[12*8, 0*8, 8, 8]]);
const imp = {
	name: "Imp",
	sprite: new Sprite(spriteSheet, [
		[9*8, 6*8, 8, 8],
		[10*8, 6*8, 8, 8],
		[11*8, 6*8, 8, 8],
		[10*8, 6*8, 8, 8]
	]),
	hp: 4,
	canDig: true
}

new Mob(imp, 28, 29);
new Mob(imp, 30, 31);

const horny = {
	sprite: new Sprite(spriteSheet, [[8*8, 6*8, 8, 12]]),
	x: 32,
	y: 32
}

const canvas = <HTMLCanvasElement>document.getElementById('canvas');
const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
canvas.addEventListener('contextmenu', e => e.preventDefault());
keyboard.init();
mouse.init();

const camera = {
	x: 0,
	y: 0
}

// create and load map
const map = new Map(64, 64);
map.load("./data/maps/test.png", (out: LoadMapCallbackArgs) => {
	camera.x = out.camX;
	camera.y = out.camY;
});

let selectState = false;

let pDelta = 0;
let fpsMax = 60;
let requestId;
(function loop(time?: number) {

	// limit framerate
	const delta = <number>time - pDelta;
	if (fpsMax && delta < 1000 / fpsMax) return;
	pDelta = delta;

	// move camera
	const speed = 0.125;
	const down = keyboard.down;
	if (down['w'] || down['W'] || down['ArrowUp']) camera.y -= speed;
	if (down['a'] || down['A'] || down['ArrowLeft']) camera.x -= speed;
	if (down['s'] || down['S'] || down['ArrowDown']) camera.y += speed;
	if (down['d'] || down['D'] || down['ArrowRight']) camera.x += speed;

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.save();
	const cx = Math.round(-camera.x * 8);
	const cy = Math.round(-camera.y * 8);
	ctx.translate(cx + 32, cy + 32);

	updateGUI();
	Mob.updateAll(map);

	// draw map
	for (let x = Math.max(0, ~~camera.x-6); x < Math.min(63, ~~camera.x+5); x++)
	for (let y = Math.max(0, ~~camera.y-6); y < Math.min(63, ~~camera.y+5); y++) {
		map.get(x, y).draw(ctx);
	}

	// draw actors
	Mob.drawAll(ctx);
	horny.sprite.draw(ctx, 0, horny.x*8, horny.y*8);

	// draw selector
	const mX = ~~(mouse.x / 10 / 8 + camera.x - 4);
	const mY = ~~(mouse.y / 10 / 8 + camera.y - 4);
	ctx.strokeRect(mX*8+0.5, mY*8+0.5, 7, 7);

	// select tiles
	if (!overGUI) {

		const tile = Tile.findByPosition(mX, mY);
		if (tile) {

			topText = tile.interface.name;

			// cancel current action
			if (mouse.pressed[3]) {
				building = false;
				console.log("cancel building");
			}

			// press, saves action state
			if (mouse.pressed[1]) {
				if (! building && tile.interface.minable) {
					tile.selected = !tile.selected;
					selectState = tile.selected;
					sfxDig.play();
				}
			}

			// hold, does action
			if (mouse.down[1]) {
				if (building) {
					if (tile.interface === TILE.FLOOR && tile.owner === 1) {
						tile.set({ interface: buildingType });
						tile.sprite = Tile.spriteFromType(tile);
					}
				}
				else if (tile.interface.minable) {
					if (tile.selected !== selectState) {
						tile.selected = selectState;
						sfxDig.play();
					}
				}
			}

		}

	}

	ctx.restore();

	//
	drawGUI();
	cursor.draw(ctx, cursorIndex, mouse.x/10, mouse.y/10);

	keyboard.update();
	mouse.update();

	requestId = requestAnimationFrame(loop);
})();

const buttons = [
	"",
	"Lair",
	"Hatchery"
]

function updateGUI() {
	overGUI = false;
	topText = "";
	displayText = "";
	cursorIndex = building ? 2 : 1;

	const mx = ~~(mouse.x / 10);
	const my = ~~(mouse.y / 10);
	if (my > 54) {
		cursorIndex = 0;
		overGUI = true;
	}

	// select itewm on GUI
	for (let n = 0; n < 7; n++) {
		if (mx>(1+n*9) && mx<(1+n*9+8) && my>55 && my<63) {
			displayText = buttons[n];
			if (mouse.pressed[1]) {
				switch (displayText) {
					case "Lair": setBuildTemplate(TILE.LAIR); break;
					case "Hatchery": setBuildTemplate(TILE.HATCHERY); break;
				}
			}
		}
	}

}

function drawGUI() {
	for (let n = 0; n < 7; n++) {
		const i = icons[n] === undefined ? 0 : n;
		icons[i].draw(ctx, 0, 1+n*9, 55);
	}

	ctx.fillStyle = "#FFFFFF";
	ctx.font = "4px Ikkle4";
	if (displayText) drawText(displayText, 32, 54);
	if (topText) drawText(topText, 32, 5);

}

function setBuildTemplate(type: TileInterface) {
	building = true;
	buildingType = type;
}

function drawText(t:string, x:number, y:number) {
	const words = t.split(" ");
	let length = (words.length - 1) * 4;
	words.forEach(w => {
		length += ctx.measureText(w).width;
	});
	let dx = x-(~~(length/2));
	words.forEach(w => {
		ctx.fillText(w, dx, y);
		dx += ctx.measureText(w).width + 4;
	});
}
