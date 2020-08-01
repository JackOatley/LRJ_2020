import { Texture } from './Texture';

export const spriteSheet = new Texture('../img/bhts.png');

export class Sprite {

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

	public draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
		this.texture.draw(
			ctx,
			this.x,
			this.y,
			this.w, this.h, Math.round(x), Math.round(y), this.w, this.h
		);
	}

}
