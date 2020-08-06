import { Sound } from 'Sound';
import { Sprite } from './Sprite';
import { Tile } from './Tile';
import { TILE, TileInterface } from './TileInterface';
import { Map } from './Map';

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
	private interface: MobInterface;
	private path: Array<Tile>;
	public jobProgress: number = 0;

	constructor(type: MobInterface, x: number, y: number) {
		this.interface = type;
		this.hp = type.hp;
		this.x = x;
		this.y = y;
		this.path = [];
		Mob.instances.push(this);
	}

	public update(map: Map) {

		// goto job
		if (this.doingJob) {

			// cancel job is it's no longer valid/possible
			if (this.job
				&& ((this.job.interface.isHigh && !this.job.selected)
				|| (!this.job.interface.isHigh && this.job.interface !== TILE.GROUND))
			) {
				jobs.splice(jobs.indexOf(this.job), 1);
				this.job = null;
				this.doingJob = false;
				console.log("job cancelled!");
			}

			// follow path to job
			if (this.path.length > 0) {
				const t = this.path[0];		// tile
				const s = 1 / 8;			// speed
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

				// dig out job
				if (this.job.interface.isHigh) {
					this.job.interface = TILE.GROUND;
					this.job.selected = false;
					sfxHit[~~(Math.random()+1)].play();
				}

				// claim tile job
				else {
					this.job.set({ interface: TILE.FLOOR, owner: 1 });
				}

				const tiles = Tile.getNeighbours(this.job);
				this.job.selected = false;
				tiles.push(this.job);
				tiles.forEach(t => {
					if (t) t.sprite = Tile.spriteFromType(t);
				});

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
		const length = tiles.length;
		for (let n = 0; n < length; n++) {

			const t = tiles[n];							// target tile
			const c = map.get(~~this.x, ~~this.y);		// current tile

			if (jobs.includes(t)) continue;				// job already taken

			// dig tile
			if (t.selected) {
				if (c) {
					const path = Tile.pathTo(c, t);
					if (path !== null) {
						this.job = t;
						this.doingJob = true;
						this.path = path;
						jobs.push(t);
						break;
					}
				}
			}

			// claim tile
			if (t.interface === TILE.GROUND) {
				const neighbours = Tile.getNeighbours(t);
				if (neighbours.some(t => t && t.owner === 1)) {
					const path = Tile.pathTo(c, t);
					if (path !== null) {
						this.job = t;
						this.doingJob = true;
						this.path = path;
						jobs.push(t);
						break;
					}
				}
			}

		}
	}

	static updateAll(map: Map) {
		Mob.instances.forEach(i => i.update(map));
	}

	static drawAll(ctx: CanvasRenderingContext2D) {
		Mob.instances.forEach(i => i.draw(ctx));
	}

}
