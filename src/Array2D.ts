export class Array2D<T> {

	readonly fill: T;
	private width: number = 0;
	private height: number = 0;
	private data: T[][] = [];

	constructor(w: number, h: number, fill: T) {
		this.fill = fill;
		this.width = w;
		this.height = h;
		this.clear(this.fill);
	}

	public get(x: number, y: number): T {
		return this.data[x][y];
	}

	public set(x: number, y: number, v: T) {
		this.data[x][y] = v;
	}

	public size(): Array<number> {
		return [this.width, this.height];
	}

	// Resizes the Array2D, no cell values are changed unless the Array2D is
	// larger than before, in which case the original fill value is used.
	public resize(w: number, h: number) {
		this.width = w;
		this.height = h;
		this.clear(this.fill);
	}

	// Clear does the real resizing, based on the current width and height
	// properties.
	public clear(v: T) {
		const w = this.width;
		const h = this.height;
		this.data.length = h;
		for (let y = 0; y < h; y++) {
			this.data[y] = this.data[y] || [];
			this.data[y].length = w;
			for (let x = 0; x < w; x++) {
				this.data[y][x] = this.data[y][x] || this.fill;
			}
		}
	}

}
