import { Texture } from './Texture';

export const spriteSheet = new Texture('../img/bhts.png');

class Frame {

	public texture: Texture;
	public x: number;
	public y: number;
	public w: number;
	public h: number;

	constructor(texture: Texture, x: number, y: number, w: number, h: number) {
		this.texture = texture;
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}

}

export class Sprite {

	public texture: Texture;
	public frames: Frame[];

	constructor(texture: Texture, frames: Array<Array<number>>) {
		this.texture = texture;
		this.frames = [];
		frames.forEach(f => {
			this.frames.push(new Frame(texture, f[0], f[1], f[2], f[3]));
		});
	}

	public draw(ctx: CanvasRenderingContext2D, i: number, x: number, y: number) {
		const frame = this.frames[i];
		frame.texture.draw(
			ctx,
			frame.x,
			frame.y,
			frame.w, frame.h, Math.round(x), Math.round(y), frame.w, frame.h
		);
	}

}
