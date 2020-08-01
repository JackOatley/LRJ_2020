interface Dict {
	[key: string]: boolean;
}

interface KeyboardEvent {
	key: string
}

export const keyboard = {
	pressed: <Dict>{},
	released: <Dict>{},
	down: <Dict>{},
	init: () => {
		document.addEventListener('keydown', (event: KeyboardEvent) => {
			if (!keyboard.down[event.key]) {
				keyboard.pressed[event.key] = true;
				keyboard.down[event.key] = true;
			}
		});
		document.addEventListener('keyup', (event: KeyboardEvent) => {
			if (keyboard.down[event.key]) {
				keyboard.released[event.key] = true;
				keyboard.down[event.key] = false;
			}
		});
	},
	update: () => {
		for (const p in keyboard.down) {
			keyboard.pressed[p] = false;
			keyboard.released[p] = false;
		}
	}
}

export const mouse = {
	x: 0,
	y: 0,
	pressed: <boolean[]>[],
	released: <boolean[]>[],
	down: <boolean[]>[],
	init: () => {
		document.addEventListener('mousemove', e => {
			mouse.x = e.offsetX;
			mouse.y = e.offsetY;
		});
		document.addEventListener("mousedown", e => {
			if (!mouse.down[e.which]) {
				mouse.pressed[e.which] = true;
				mouse.down[e.which] = true;
			}
		});
		document.addEventListener("mouseup", e => {
			if (mouse.down[e.which]) {
				mouse.released[e.which] = true;
				mouse.down[e.which] = false;
			}
		});
	},
	update: () => {
		for (let n = 0; n < mouse.pressed.length; n++) {
			mouse.pressed[n] = false;
			mouse.released[n] = false;
		}
	}
}
