import { Sprite, spriteSheet } from './Sprite';
import { TILE, TileInterface } from './TileInterface';

export class Tile {

	static id: number = 0;
	static instances: Array<Tile> = [];

	readonly id: number;
	readonly x: number;
	readonly y: number;
	public sprite: Sprite;
	private owner: number;
	public interface: TileInterface;
	public faces: number = 0b00000000;
	public selected: boolean = false;

	constructor(i: TileInterface, x: number, y: number) {
		this.id = Tile.id++;
		this.x = x;
		this.y = y;
		this.interface = i;
		this.sprite = new Sprite(spriteSheet, [[0, 0, 8, 8]]);
		Tile.instances.push(this);
	}

	public draw(ctx: CanvasRenderingContext2D) {
		if (this.sprite) {
			this.sprite.draw(ctx, 0, this.x*8, this.y*8);
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

		const path = [];
		const limit: number = 100;
		const visited: Array<Tile | null> = [];
		const next: Array<Tile | null> = [a];
		const values: Array<number> = [];

		let n = 0
		let val = 0;
		values[a.id] = 1;
		while (next.length > 0) {
			if (n++ >= limit) break;

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

					const n = Tile.findByPosition(c.x, c.y-1);
					const s = Tile.findByPosition(c.x, c.y+1);
					const e = Tile.findByPosition(c.x+1, c.y);
					const w = Tile.findByPosition(c.x-1, c.y);

					if (n && !visited.includes(n) && !next.includes(n)) { next.push(n); }
					if (s && !visited.includes(s) && !next.includes(s)) { next.push(s); }
					if (e && !visited.includes(e) && !next.includes(e)) { next.push(e); }
					if (w && !visited.includes(w) && !next.includes(w)) { next.push(w); }
					if (n) values[n.id] = Math.min(v+1, values[n.id] || 1000000);
					if (s) values[s.id] = Math.min(v+1, values[s.id] || 1000000);
					if (e) values[e.id] = Math.min(v+1, values[e.id] || 1000000);
					if (w) values[w.id] = Math.min(v+1, values[w.id] || 1000000);

					if ([n, s, e, w].includes(b)) {
						let p = c;
						const lim = 100;
						let i = 0;
						while (p !== a) {
							path.push(p);
							if (i++ >= lim) break;
							const n = Tile.findByPosition(p.x, p.y-1);
							const s = Tile.findByPosition(p.x, p.y+1);
							const e = Tile.findByPosition(p.x+1, p.y);
							const w = Tile.findByPosition(p.x-1, p.y);
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
						//console.log("done!", path.reverse());
					}

				}

			}

		}

		path.reverse();
		return path;

	}

}
