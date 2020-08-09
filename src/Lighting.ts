import { Map } from 'Map';
import { TILE } from 'TileInterface';

export const lightingCanvas = document.createElement('canvas');
export const lightingContext = <CanvasRenderingContext2D>lightingCanvas.getContext('2d');
lightingCanvas.width = 64;
lightingCanvas.height = 64;

const lightColors = [

]

export function lightingUpdate(map:Map, x:number, y:number) {
	lightingContext.fillStyle = '#000000';
	lightingContext.fillRect(0, 0, 64, 64);

	// region lights
	lightingContext.fillStyle = '#ff567c';
	lightingContext.beginPath();
	for (let x = 0; x < map.width; x += 3)
	for (let y = 0; y < map.height; y += 3) {
		const t = map.get(x, y);
		if (t && t.owner !== 0) {
			lightingContext.moveTo(x+0.5, y);
			lightingContext.ellipse(x+0.5, y, 1.5, 1.5, 0, 0, Math.PI*2);
		}
	}
	lightingContext.fill();

	// cursor light
	lightingContext.beginPath();
	lightingContext.fillStyle = '#ffffff';
	lightingContext.moveTo(x+0.5, y);
	lightingContext.ellipse(x+0.5, y, 3.5, 3.5, 0, 0, Math.PI*2);
	lightingContext.fill();

}
