export class Texture {

	private image: HTMLImageElement = new Image();

	constructor(src: string) {
		this.image.src = src;
	}

	public draw(
		ctx: CanvasRenderingContext2D,
		sx: number, sy: number, sw: number, sh: number,
		dx: number, dy: number, dw: number, dh: number
	) {
		ctx.drawImage(this.image, sx, sy, sw, sh, dx, dy, dw, dh);
	}

}
