import { Array2D } from './Array2D';
import { keyboard } from './Input';
import { Texture } from './Texture';
import { Tile } from './Tile';
import { TILE, TileInterface } from './TileInterface';
import { Sprite, spriteSheet } from './Sprite';

export interface LoadMapCallbackArgs {
	camX: number;
	camY: number;
}

export class Map {

	private _width: number;
	private _height: number;
	private tiles: Array2D<Tile>;
	private loading: boolean = true;

	get width(): number { return this._width; }
	get height(): number { return this._height; }

	constructor(w: number, h: number) {
		this._width = w;
		this._height = h;
		this.tiles = new Array2D(w, h, new Tile(TILE.NULL, 0, 0));
	}

	public get(x: number, y: number): Tile {
		return this.tiles.get(x, y);
	}

	public set(x: number, y: number, v: Tile) {
		this.tiles.set(x, y, v);
	}

	public resize(w: number, h: number) {
		[this._width, this._height] = [w, h];
		this.tiles.resize(w, h);
	}

	public load(src: string, callback: Function) {
		const image = new Image();
		image.onload = () => {

			let out = <LoadMapCallbackArgs>{};

			// create canvas and context for reading the map
			const {width, height} = image;
			const canvas = <HTMLCanvasElement>document.createElement('canvas');
			const context = <CanvasRenderingContext2D>canvas.getContext('2d');
			canvas.width = width;
			canvas.height = height;
			context.drawImage(image, 0, 0);

			// place tiles depending on pixel color
			const imageData = context.getImageData(0, 0, width, height);
			const pixels = imageData.data;
			for (let n = 0, y = 0; y < this._height; y++)
			for (let x = 0; x < this._width; x++, n += 4) {
				const color = [pixels[n], pixels[n+1], pixels[n+2]];
				const [r, g, b] = color;
				switch (true) {
					case (r===0 && g===255 && b===0):
						out.camX = x;
						out.camY = y;
						break;
					default:
						const type = Tile.tileFromColor(color);
						const tile = new Tile(type, x, y);
						this.set(x, y, tile);
						break;
				}
			}

			// init sprites
			Tile.instances.forEach(t => {
				t.sprite = Tile.spriteFromType(t);
			});

			callback(out);

		}
		image.src = src;
	}

}
