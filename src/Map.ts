import { Array2D } from './Array2D';
import { keyboard } from './Input';
import { Texture } from './Texture';
import { Tile, SetTile } from './Tile';
import { TILE, TileInterface } from './TileInterface';
import { Sprite, spriteSheet } from './Sprite';
import { Mob } from 'Mob';
import { CREATURE } from 'Creature';

const dungeonHeart = new Sprite(spriteSheet, [
	[13*8, 2*8, 24, 24],
	[13*8, 5*8, 24, 24],
	[13*8, 8*8, 24, 24],
	[13*8, 5*8, 24, 24]
]);

const portal = new Sprite(spriteSheet, [
	[13*8, 11*8, 24, 24]
]);

const heroGate = new Sprite(spriteSheet, [
	[10*8, 11*8, 24, 24]
]);

export interface LoadMapCallbackArgs {
	camX: number;
	camY: number;
}

export interface BuildingInterface {
	name: string;
	id: number;
	owner: number;
}

export class Map {

	static buildingID = 1;
	static buildings: Array<BuildingInterface> = [];

	private _width: number;
	private _height: number;
	public tiles: Array2D<Tile>;
	private loading: boolean = true;

	get width():number { return this._width; }
	get height():number { return this._height; }

	constructor(w:number, h:number) {
		this._width = w;
		this._height = h;
		this.tiles = new Array2D(w, h, new Tile(TILE.NULL, 0, 0));
	}

	public get(x:number, y:number): Tile {
		return this.tiles.get(x, y);
	}

	public set(x:number, y:number, v:Tile) {
		this.tiles.set(x, y, v);
	}

	public setArea(x1:number, y1:number, x2:number, y2:number, obj:SetTile) {
		for (let x = x1; x <= x2; x++)
		for (let y = y1; y <= y2; y++) {
			this.get(x, y).set(obj);
		}
	}

	public resize(w:number, h:number) {
		[this._width, this._height] = [w, h];
		this.tiles.resize(w, h);
	}

	public load(src:string, callback:Function) {
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

			const imageData = context.getImageData(0, 0, width, height);
			const pixels = imageData.data;

			// place tiles depending on pixel color
			for (let n = 0, y = 0; y < height; y++)
			for (let x = 0; x < width; x++, n += 4) {
				const color = [pixels[n], pixels[n+1], pixels[n+2]];
				const [r, g, b] = color;
				switch (true) {

					default:
						const type = Tile.tileFromColor(color);
						const tile = new Tile(type, x, y);
						this.set(x, y, tile);
						break;

				}
			}

			// place specials; buildings, etc
			for (let n = 0, y = 0; y < height; y++)
			for (let x = 0; x < width; x++, n += 4) {
				const color = [pixels[n], pixels[n+1], pixels[n+2]];
				const [r, g, b] = color;
				let i;
				switch (true) {

					// dungeon heart
					case (r===0 && g===255 && b===0):
						out.camX = x;
						out.camY = y;
						i = Map.getNewBuilding("Dungeon Heart", 1);
						this.setArea(x-2, y-2, x+2, y+2, { interface: TILE.TREASURY, owner: 1 });
						this.setArea(x-1, y-1, x+1, y+1, { interface: TILE.NULL, partOf: i, owner: 1 });
						this.setArea(x-1, y-1, x-1, y-1, { interface: TILE.SPECIAL, sprite: dungeonHeart });
						new Mob(CREATURE.IMP, x-2, y-1);
						new Mob(CREATURE.IMP, x-2, y+1);
						new Mob(CREATURE.IMP, x+2, y-1);
						new Mob(CREATURE.IMP, x+2, y+1);
						break;

					// portal
					case (r===0 && g===0 && b===255):
						i = Map.getNewBuilding("Portal", 0);
						this.setArea(x-1, y-1, x+1, y+1, { interface: TILE.NULL, partOf: i, owner: 0 });
						this.setArea(x-1, y-1, x-1, y-1, { interface: TILE.SPECIAL, sprite: portal });
						break;

						// hero gate
						case (r===255 && g===0 && b===255):
							i = Map.getNewBuilding("Hero Gate", 0);
							this.setArea(x-1, y-1, x+1, y+1, { interface: TILE.NULL, partOf: i, owner: 2 });
							this.setArea(x-1, y-1, x-1, y-1, { interface: TILE.SPECIAL, sprite: heroGate });
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

	static getNewBuilding(name: string, owner: number): number {
		Map.buildings.push({
			id: Map.buildingID,
			name: name,
			owner: owner
		})
		return Map.buildingID++;
	}

	static getBuilding(t: Tile): BuildingInterface | undefined {
		return Map.buildings.find(b => t.partOf === b.id);
	}

}
