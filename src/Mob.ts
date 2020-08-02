import { Sprite } from './Sprite';
import { Tile } from './Tile';

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

	constructor(type: MobInterface, x: number, y: number) {
		this.interface = type;
		this.hp = type.hp;
		this.x = x;
		this.y = y;
		this.path = [];
		Mob.instances.push(this);
	}

	public update() {

		// goto job
		if (this.doingJob) {

			if (this.job && !this.job.selected) {
				this.job = null;
				this.doingJob = false;
				console.log("job cancelled!");
			}

			if (this.path) {
				const t = this.path[0];
				if (t) {
					if (this.x != t.x) this.x += Math.sign(t.x - this.x) * 1 / 8;
					if (this.y != t.y) this.y += Math.sign(t.y - this.y) * 1 / 8;
					//console.log(this.x, this.y, t.x, t.y);
					if (this.x === t.x && this.y === t.y) {
						//console.log(this.path);
						this.path.shift();
					}
				}
			}

		}

		// find a new job
		if (!this.doingJob && this.interface.canDig) {
			const job = this.findJob();
		}

	}

	public draw(ctx: CanvasRenderingContext2D) {
		const i = ~~(performance.now() / 100) % 4;
		this.interface.sprite.draw(ctx, i, this.x*8, this.y*8);
	}

	public findJob() {
		for (let n = 0; n < Tile.instances.length; n++) {
			const t = Tile.instances[n];
			const c = <Tile>Tile.findByPosition(~~this.x, ~~this.y);
			if (t.selected && c) {
				const path = Tile.pathTo(c, t);
				if (path !== null) {
					this.job = t;
					this.doingJob = true;
					this.path = path;
					console.log("found job!");
				}
			}
		}
	}

	static updateAll() {
		Mob.instances.forEach(i => i.update());
	}

	static drawAll(ctx: CanvasRenderingContext2D) {
		Mob.instances.forEach(i => i.draw(ctx));
	}

}
