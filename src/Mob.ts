import { Sound } from 'Sound';
import { Sprite } from './Sprite';
import { Tile } from './Tile';
import { TILE, TileInterface } from './TileInterface';
import { Map, BuildingInterface } from './Map';

const jobs: Tile[] = [];

const sfxHit = [
	new Sound("./data/sfx/hit1.wav", 5),
	new Sound("./data/sfx/hit2.wav", 5)
];

export interface MobInterface {
	sprite: Sprite;
	name: string;
	hp: number;
	canDig?: boolean;
}

export class Mob {

	static instances: Array<Mob> = [];

	public x: number;
	public y: number;
	public hp: number;
	public job: Tile | null;
	public doingJob: boolean = false;
	public interface: MobInterface;
	private path: Array<Tile>;
	public jobProgress: number = 0;
	public brainTick: number = 0;
	public brainMax: number = 64;
	public speed: number = 1 / 16;

	constructor(type: MobInterface, x: number, y: number) {
		this.interface = type;
		this.hp = type.hp;
		this.x = x;
		this.y = y;
		this.path = [];
		Mob.instances.push(this);
	}

	public update(map: Map) {

		// goto job, if doing one
		if (this.doingJob) {

			// follow path to job
			if (this.path.length > 0) {
				const t = this.path[0];		// tile
				const s = this.speed;		// speed
				if (t) {
					if (this.x != t.x) this.x += Math.sign(t.x - this.x) * s;
					if (this.y != t.y) this.y += Math.sign(t.y - this.y) * s;
					if (this.x === t.x && this.y === t.y) {
						this.path.shift();
					}
				}
			}

			// at job
			else if (this.job) {

				if (this.jobProgress++ < 20) return;
				this.jobProgress = 0;

				if (this.job.interface.isHigh) {

					// dig out job
					if (this.job.selected) {
						this.job.interface = TILE.GROUND;
						this.job.selected = false;
						this.job.owner = 0;
						sfxHit[~~(Math.random()+1)].play();
					}

					// claim/build wall
					else {
						this.job.interface = TILE.WALL;
						this.job.owner = 1;
						this.job.selected = false;
					}
				}

				// claim tile job
				else {
					const job = this.job;
					if (job.partOf !== 0) {
						const building = Map.buildings.find(e => e.id === job.partOf);
						(<BuildingInterface>building).owner = 1;
						const o = { owner: 1 };
						let n = 0;
						map.tiles.forEach((t:Tile) => {
							if (job && t.partOf === job.partOf) {
								t.set(o);
								n++;
							}
						});
					} else {
						const o = { interface: TILE.FLOOR, owner: 1 };
						job.set(o);
					}
				}

				const tiles = Tile.getNeighbours(this.job);
				this.job.selected = false;
				tiles.push(this.job);
				tiles.forEach(t => {
					if (t) t.sprite = Tile.spriteFromType(t);
				});
				const i = jobs.indexOf(this.job);
				jobs.splice(i, 1);
				this.job = null;
				this.doingJob = false;

			}

		}

		// idle
		else {
			if (!this.path || this.path.length === 0) {
				const c = map.get(~~this.x, ~~this.y);		// current tile
				const filtered: Array<Tile> = [];
				map.tiles.forEach((t:Tile) => {
					if (t.interface === TILE.FLOOR && t.owner === 1) {
						filtered.push(t);
					}
				});
				const i = ~~(Math.random() * filtered.length);
				const t = filtered[i];
				if (t) {
					this.path = <Array<Tile>>Tile.pathTo(c, t);
					//console.log(this.path);
				}
			} else {

				// follow path to job
				if (this.path.length > 0) {
					const t = this.path[0];		// tile
					const s = this.speed;		// speed
					if (t) {
						if (this.x != t.x) this.x += Math.sign(t.x - this.x) * s;
						if (this.y != t.y) this.y += Math.sign(t.y - this.y) * s;
						if (this.x === t.x && this.y === t.y) {
							this.path.shift();
						}
					}
				}

			}
		}

		// find a new job
		if (!this.doingJob && this.interface.canDig) {
			this.findJob(map);
		}

	}

	public draw(ctx: CanvasRenderingContext2D) {
		const i = ~~(performance.now() / 100) % 4;
		this.interface.sprite.draw(ctx, i, this.x*8, this.y*8);
	}

	public findJob(map: Map) {
		const tiles = Tile.instances;
		this.brainTick = this.brainTick % tiles.length;
		const start = this.brainTick;
		const max = ~~(Math.random() * this.brainMax);
		const end = Math.min(this.brainTick+this.brainMax, tiles.length);
		for (let n = start; n < end; this.brainTick++, n++) {

			const t = tiles[n];							// target tile
			const c = map.get(~~this.x, ~~this.y);		// current tile

			if (jobs.includes(t)) continue;				// job already taken

			// dig tile
			if (t.selected) {
				if (c) {
					const path = Tile.pathTo(c, t);
					if (path !== null) {
						this.takeJob(t, path);
						break;
					}
				}
			}

			// claim tile
			if (t.interface === TILE.GROUND) {
				const neighbours = Tile.getNeighbours(t);
				if (neighbours.some(t => t && !t.interface.isHigh && t.owner === 1)) {
					const path = Tile.pathTo(c, t);
					if (path !== null) {
						this.takeJob(t, path);
						break;
					}
				}
			}

			// claim room
			if (t.partOf !== 0 && t.owner !== 1) {
				const neighbours = Tile.getNeighbours(t);
				if (neighbours.some(t => t && !t.interface.isHigh && t.owner === 1)) {
					const path = Tile.pathTo(c, t);
					if (path !== null) {
						this.takeJob(t, path);
						break;
					}
				}
			}

			// claim wall
			if (t.interface === TILE.DIRT) {
				const neighbours = Tile.getNeighbours(t);
				if (neighbours.some(t => t && !t.interface.isHigh && t.owner === 1)) {
					const path = Tile.pathTo(c, t);
					if (path !== null) {
						this.takeJob(t, path);
						break;
					}
				}
			}

		}
	}

	private takeJob(t:Tile, path:Array<Tile>) {
		this.job = t;
		this.doingJob = true;
		this.path = path;
		jobs.push(t);
	}

	static updateAll(map: Map) {
		Mob.instances.forEach(i => i.update(map));
	}

	static drawAll(ctx: CanvasRenderingContext2D) {
		Mob.instances.forEach(i => i.draw(ctx));
	}

}
