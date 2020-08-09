import { Sprite, spriteSheet } from './Sprite';
import { TILE, TileInterface } from './TileInterface';

export interface SetTile {
	interface?: TileInterface;
	owner?: number;
	sprite?: Sprite;
	partOf?: number;
}

export class Tile {

	static id: number = 0;
	static instances: Array<Tile> = [];

	readonly id: number;
	readonly x: number;
	readonly y: number;
	public sprite: Sprite;
	public owner: number = 0;
	public interface: TileInterface;
	public faces: number = 0b00000000;
	public selected: boolean = false;
	public partOf: number = 0;			// tile is part of a room, room ID

	constructor(i: TileInterface, x: number, y: number) {
		this.id = Tile.id++;
		this.x = x;
		this.y = y;
		this.interface = i;
		this.sprite = new Sprite(spriteSheet, [[0, 0, 8, 8]]);
		Tile.instances.push(this);
	}

	public set(obj: SetTile) {
		if (obj.owner) this.owner = obj.owner;
		if (obj.interface) this.interface = obj.interface;
		if (obj.sprite) this.sprite = obj.sprite;
		if (obj.partOf) this.partOf = obj.partOf;
	}

	public draw(ctx: CanvasRenderingContext2D) {
		if (this.interface === TILE.NULL) {
			return;
		}
		if (this.owner) {
			ctx.fillStyle = "#911A1A";
			ctx.fillRect(this.x*8, this.y*8, 8, 8);
		}
		if (this.sprite) {
			this.sprite.draw(ctx, performance.now()/100, this.x*8, this.y*8);
		}
		if (this.selected) {
			ctx.fillStyle = "#FFFF00";
			ctx.globalAlpha = 0.75 + Math.sin(performance.now() / 250) * 0.25;
			ctx.fillRect(this.x*8, this.y*8, 8, 8);
			ctx.globalAlpha = 1;
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

		if (tile.interface === TILE.SPECIAL)
			return tile.sprite;

		let [x, y, w, h] = [0, 0, 8, 8];
		switch (tile.interface) {
			case TILE.BEDROCK: [x, y] = [7*8, 6*8]; break;
			case TILE.DIRT: [x, y] = [7*8, 0]; break;
			case TILE.FLOOR: [x, y] = [11*8, 1*8]; break;
			case TILE.GOLD: [x, y] = [11*8, 0]; break;
			case TILE.GROUND: [x, y] = [13*8, 1*8]; break;
			case TILE.LAIR: [x, y] = [12*8, 0]; break;
			case TILE.HATCHERY: [x, y] = [13*8, 0]; break;
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

			if ( u &&  d &&  l && !r) [x, y] = [6*8, 2*8];	// u + d + l
			if ( u &&  d && !l &&  r) [x, y] = [4*8, 2*8];	// u + d + r

			// purely diags
			if (!u && !d && !l && !r) {
				if (!ul && !ur &&  dl && !dr) [x, y] = [6*8, 4*8];	// dl

				if (!ul && !ur &&  dl &&  dr) [x, y] = [5*8, 5*8];	// dl + dr
			}

			if (u || d || l || r) {
				if (tile.interface === TILE.BEDROCK) y += 6 * 8;
				if (tile.interface === TILE.GOLD) x += 4 * 8;
				if (tile.interface === TILE.WALL) x -= 4 * 8;
			}

		}

		return new Sprite(spriteSheet, [[x, y, w, h]]);

	}

	static findByPosition(x: number, y: number): Tile | null {
		for (let n = 0; n < Tile.instances.length; n++) {
			const tile = Tile.instances[n];
			if (tile.x === x && tile.y === y)
				return tile;
		}
		return null;
	}

	static pathTo(a: Tile, b: Tile): Array<Tile> | null {

		// tile b is totally blocked, cannot path
		const neighbours = Tile.getNeighbours(b);
		if (neighbours.every(t => t && t.interface.isHigh))
			return null;

		const visited: Array<Tile | null> = [];
		const next: Array<Tile | null> = [a];
		const values: Array<number> = [];

		let val = 0;
		values[a.id] = 1;
		while (next.length > 0) {

			//
			const c = <Tile>next.shift();
			visited.push(c);
			if (c) {

				if (c.interface.isHigh) {
					values[c.id] = 1000000;
				}

				// get neighbours
				else {

					const v = values[c.id];
					const neighbours = Tile.getNeighbours(c);
					const [n, e, s, w] = neighbours;

					if (n && !visited.includes(n) && !next.includes(n)) next.push(n);
					if (s && !visited.includes(s) && !next.includes(s)) next.push(s);
					if (e && !visited.includes(e) && !next.includes(e)) next.push(e);
					if (w && !visited.includes(w) && !next.includes(w)) next.push(w);
					if (n) values[n.id] = Math.min(v+1, values[n.id] || 1000000);
					if (s) values[s.id] = Math.min(v+1, values[s.id] || 1000000);
					if (e) values[e.id] = Math.min(v+1, values[e.id] || 1000000);
					if (w) values[w.id] = Math.min(v+1, values[w.id] || 1000000);

					if (neighbours.includes(b)) {

						const path = [];
						if (!b.interface.isHigh)
							path.push(b);

						let p = c;
						while (p !== a) {
							path.push(p);
							const [n, e, s, w] = Tile.getNeighbours(p);
							if (n && values[n.id] !== undefined && values[n.id] < values[p.id]) {
								p = n;
							}
							if (s && values[s.id] !== undefined && values[s.id] < values[p.id]){
								p = s;
							}
							if (e && values[e.id] !== undefined && values[e.id] < values[p.id]) {
								p = e;
							}
							if (w && values[w.id] !== undefined && values[w.id] < values[p.id]) {
								p = w;
							}
						}

						path.reverse();
						return path;

					}

				}

			}

		}

		return null;

	}

	static getNeighbours(t: Tile): Array<Tile | null> {
		return [
			Tile.findByPosition(t.x, t.y-1),
			Tile.findByPosition(t.x, t.y+1),
			Tile.findByPosition(t.x+1, t.y),
			Tile.findByPosition(t.x-1, t.y)
		];
	}

}
