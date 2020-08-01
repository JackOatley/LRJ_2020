import { Array2D } from './Array2D';
import { keyboard, mouse } from './Input';
import { Texture } from './Texture';
import { Tile } from './Tile';
import { TILE, TileInterface } from './TileInterface';
import { Sprite, spriteSheet } from './Sprite';
import { Map, LoadMapCallbackArgs } from './Map';

const cursor = new Sprite(spriteSheet, 7*8, 7*8, 8, 12);

const horny = {
	sprite: new Sprite(spriteSheet, 8*8, 6*8, 8, 12),
	x: 32,
	y: 32
}

const canvas = <HTMLCanvasElement>document.getElementById('canvas');
const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
keyboard.init();
mouse.init();

const camera = {
	x: 0,
	y: 0
}

// create and load map
const map = new Map(64, 64);
map.load("../data/maps/test.png", (out: LoadMapCallbackArgs) => {
	camera.x = out.camX;
	camera.y = out.camY;
});

let selectState = false;

requestAnimationFrame(function loop() {

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

	// draw map
	for (let x = Math.max(0, ~~camera.x-4); x < Math.min(63, ~~camera.x+5); x++)
	for (let y = Math.max(0, ~~camera.y-4); y < Math.min(63, ~~camera.y+5); y++) {
		map.get(x, y).draw(ctx);
	}

	// draw actors
	horny.sprite.draw(ctx, horny.x*8, horny.y*8);

	// draw selector
	const mX = ~~(mouse.x / 10 / 8 + camera.x - 4);
	const mY = ~~(mouse.y / 10 / 8 + camera.y - 4);
	ctx.strokeRect(mX*8+0.5, mY*8+0.5, 7, 7);

	// select tiles
	if (mouse.pressed[1]) {
		const tile = Tile.findByPosition(mX, mY);
		if (tile && tile.interface.minable) {
			tile.selected = !tile.selected;
			selectState = tile.selected;
		}
	}

	if (mouse.down[1]) {
		const tile = Tile.findByPosition(mX, mY);
		if (tile && tile.interface.minable) {
			tile.selected = selectState;
		}
	}

	ctx.restore();

	// draw cursor
	cursor.draw(ctx, mouse.x/10, mouse.y/10);

	keyboard.update();
	mouse.update();

	requestAnimationFrame(loop);
});
