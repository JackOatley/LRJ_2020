import { Sprite, spriteSheet } from './Sprite';
import { TILE, TileInterface } from './TileInterface';

export class Tile {

	static instances: Array<Tile> = [];

	readonly x: number;
	readonly y: number;
	public sprite: Sprite;
	private owner: number;
	public interface: TileInterface;
	public faces: number = 0b00000000;
	public selected: boolean = false;

	constructor(i: TileInterface, x: number, y: number) {
		this.x = x;
		this.y = y;
		this.interface = i;
		this.sprite = new Sprite(spriteSheet, 0, 0, 8, 8);
		Tile.instances.push(this);
	}

	public draw(ctx: CanvasRenderingContext2D) {
		if (this.sprite) {
			this.sprite.draw(ctx, this.x*8, this.y*8);
			if (this.selected) {
				ctx.fillStyle = "#FFFF00";
				ctx.globalAlpha = 0.75 + Math.sin(performance.now() / 250) * 0.25;
				ctx.fillRect(this.x*8, this.y*8, 8, 8);
				ctx.globalAlpha = 1;
			}
		}
	}

	static tileFromColor(color: Array<number>) {
		const [r, g, b] = color;
		switch (true) {
			case (r===255 && g===0   && b===0):   return TILE.BEDROCK;
			case (r===255 && g===100 && b===0):   return TILE.DIRT;
			case (r===255 && g===255 && b===255): return TILE.GROUND;
			case (r===255 && g===255 && b===0):   return TILE.GOLD;
			default: return TILE.BEDROCK;
		}
	}

	static spriteFromType(tile: Tile): Sprite {

		let [x, y, w, h] = [0, 0, 8, 8];
		switch (tile.interface) {
			case TILE.BEDROCK: [x, y] = [7*8, 6*8]; break;
			case TILE.DIRT: [x, y] = [7*8, 0]; break;
			case TILE.GOLD: [x, y] = [11*8, 0]; break;
			case TILE.GROUND: [x, y] = [13*8, 1*8]; break;
			default: [x, y] = [0, 0]; break;
		}

		let [u, d, l, r] = [false, false, false, false];
		let [dl, dr, ul, ur] = [false, false, false, false];
		if (tile.interface.hasFaces) {
			let t;

			t = Tile.findByPosition(tile.x, tile.y-1);
			u = <boolean>(t instanceof Tile && !t.interface.isHigh);

			t = Tile.findByPosition(tile.x, tile.y+1);
			d = <boolean>(t instanceof Tile && !t.interface.isHigh);

			t = Tile.findByPosition(tile.x-1, tile.y);
			l = <boolean>(t instanceof Tile && !t.interface.isHigh);

			t = Tile.findByPosition(tile.x+1, tile.y);
			r = <boolean>(t instanceof Tile && !t.interface.isHigh);

			t = Tile.findByPosition(tile.x-1, tile.y+1);
			dl = <boolean>(t instanceof Tile && !t.interface.isHigh);

			t = Tile.findByPosition(tile.x+1, tile.y+1);
			dr = <boolean>(t instanceof Tile && !t.interface.isHigh);

			if ( u && !d && !l && !r) [x, y] = [6*8, 5*8];	// u
			if (!u &&  d && !l && !r) [x, y] = [4*8, 4*8];	// d
			if (!u && !d &&  l && !r) [x, y] = [4*8, 3*8];	// l
			if (!u && !d && !l &&  r) [x, y] = [5*8, 3*8];	// r
			if ( u &&  d && !l && !r) [x, y] = [5*8, 1*8];	// u + d
			if (!u && !d &&  l &&  r) [x, y] = [4*8, 0*8];	// l + r
			if ( u && !d && !l &&  r) [x, y] = [7*8, 3*8];	// u + r
			if ( u && !d &&  l && !r) [x, y] = [7*8, 2*8];	// u + l
			if (!u &&  d && !l &&  r) [x, y] = [4*8, 2*8];	// d + r
			if (!u &&  d &&  l && !r) [x, y] = [4*8, 1*8];	// d + l
			if (!u &&  d &&  l &&  r) [x, y] = [5*8, 0*8];	// d + l + r
			if ( u && !d &&  l &&  r) [x, y] = [4*8, 0*8];	// u + l + r

			// purely diags
			if (!u && !d && !l && !r) {
				if (!ul && !ur &&  dl && !dr) [x, y] = [6*8, 4*8];	// dl

				if (!ul && !ur &&  dl &&  dr) [x, y] = [5*8, 5*8];	// dl + dr
			}

			if (u || d || l || r) {
				if (tile.interface === TILE.BEDROCK) y += 6 * 8;
				if (tile.interface === TILE.GOLD) x += 4 * 8;
			}

		}

		return new Sprite(spriteSheet, x, y, w, h);

	}

	static findByPosition(x: number, y: number): Tile | null {
		for (let n = 0; n < Tile.instances.length; n++) {
			const tile = Tile.instances[n];
			if (tile.x === x && tile.y === y)
				return tile;
		}
		return null;
	}

}
