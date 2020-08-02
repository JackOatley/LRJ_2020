define("Array2D", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Array2D = void 0;
    class Array2D {
        constructor(w, h, fill) {
            this.width = 0;
            this.height = 0;
            this.data = [];
            this.fill = fill;
            this.width = w;
            this.height = h;
            this.clear(this.fill);
        }
        get(x, y) {
            return this.data[x][y];
        }
        set(x, y, v) {
            this.data[x][y] = v;
        }
        size() {
            return [this.width, this.height];
        }
        resize(w, h) {
            this.width = w;
            this.height = h;
            this.clear(this.fill);
        }
        clear(v) {
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
    exports.Array2D = Array2D;
});
define("Input", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mouse = exports.keyboard = void 0;
    exports.keyboard = {
        pressed: {},
        released: {},
        down: {},
        init: () => {
            document.addEventListener('keydown', (event) => {
                if (!exports.keyboard.down[event.key]) {
                    exports.keyboard.pressed[event.key] = true;
                    exports.keyboard.down[event.key] = true;
                }
            });
            document.addEventListener('keyup', (event) => {
                if (exports.keyboard.down[event.key]) {
                    exports.keyboard.released[event.key] = true;
                    exports.keyboard.down[event.key] = false;
                }
            });
        },
        update: () => {
            for (const p in exports.keyboard.down) {
                exports.keyboard.pressed[p] = false;
                exports.keyboard.released[p] = false;
            }
        }
    };
    exports.mouse = {
        x: 0,
        y: 0,
        pressed: [],
        released: [],
        down: [],
        init: () => {
            document.addEventListener('mousemove', e => {
                exports.mouse.x = e.offsetX;
                exports.mouse.y = e.offsetY;
            });
            document.addEventListener("mousedown", e => {
                if (!exports.mouse.down[e.which]) {
                    exports.mouse.pressed[e.which] = true;
                    exports.mouse.down[e.which] = true;
                }
            });
            document.addEventListener("mouseup", e => {
                if (exports.mouse.down[e.which]) {
                    exports.mouse.released[e.which] = true;
                    exports.mouse.down[e.which] = false;
                }
            });
        },
        update: () => {
            for (let n = 0; n < exports.mouse.pressed.length; n++) {
                exports.mouse.pressed[n] = false;
                exports.mouse.released[n] = false;
            }
        }
    };
});
define("Texture", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Texture = void 0;
    class Texture {
        constructor(src) {
            this.image = new Image();
            this.image.src = src;
        }
        draw(ctx, sx, sy, sw, sh, dx, dy, dw, dh) {
            ctx.drawImage(this.image, sx, sy, sw, sh, dx, dy, dw, dh);
        }
    }
    exports.Texture = Texture;
});
define("Sprite", ["require", "exports", "Texture"], function (require, exports, Texture_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Sprite = exports.spriteSheet = void 0;
    exports.spriteSheet = new Texture_1.Texture('../img/bhts.png');
    class Frame {
        constructor(texture, x, y, w, h) {
            this.texture = texture;
            this.x = x;
            this.y = y;
            this.w = w;
            this.h = h;
        }
    }
    class Sprite {
        constructor(texture, frames) {
            this.texture = texture;
            this.frames = [];
            frames.forEach(f => {
                this.frames.push(new Frame(texture, f[0], f[1], f[2], f[3]));
            });
        }
        draw(ctx, i, x, y) {
            const frame = this.frames[i];
            frame.texture.draw(ctx, frame.x, frame.y, frame.w, frame.h, Math.round(x), Math.round(y), frame.w, frame.h);
        }
    }
    exports.Sprite = Sprite;
});
define("TileInterface", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TILE = void 0;
    exports.TILE = {
        NULL: { name: "NULL" },
        GROUND: { name: "Ground", },
        BEDROCK: { name: "Bedrock", hasFaces: true, isHigh: true },
        DIRT: { name: "Dirt", hasFaces: true, isHigh: true, minable: true },
        GOLD: { name: "Gold", hasFaces: true, isHigh: true, minable: true }
    };
});
define("Tile", ["require", "exports", "Sprite", "TileInterface"], function (require, exports, Sprite_1, TileInterface_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Tile = void 0;
    class Tile {
        constructor(i, x, y) {
            this.faces = 0b00000000;
            this.selected = false;
            this.id = Tile.id++;
            this.x = x;
            this.y = y;
            this.interface = i;
            this.sprite = new Sprite_1.Sprite(Sprite_1.spriteSheet, [[0, 0, 8, 8]]);
            Tile.instances.push(this);
        }
        draw(ctx) {
            if (this.sprite) {
                this.sprite.draw(ctx, 0, this.x * 8, this.y * 8);
                if (this.selected) {
                    ctx.fillStyle = "#FFFF00";
                    ctx.globalAlpha = 0.75 + Math.sin(performance.now() / 250) * 0.25;
                    ctx.fillRect(this.x * 8, this.y * 8, 8, 8);
                    ctx.globalAlpha = 1;
                }
            }
        }
        static tileFromColor(color) {
            const [r, g, b] = color;
            switch (true) {
                case (r === 255 && g === 0 && b === 0): return TileInterface_1.TILE.BEDROCK;
                case (r === 255 && g === 100 && b === 0): return TileInterface_1.TILE.DIRT;
                case (r === 255 && g === 255 && b === 255): return TileInterface_1.TILE.GROUND;
                case (r === 255 && g === 255 && b === 0): return TileInterface_1.TILE.GOLD;
                default: return TileInterface_1.TILE.BEDROCK;
            }
        }
        static spriteFromType(tile) {
            let [x, y, w, h] = [0, 0, 8, 8];
            switch (tile.interface) {
                case TileInterface_1.TILE.BEDROCK:
                    [x, y] = [7 * 8, 6 * 8];
                    break;
                case TileInterface_1.TILE.DIRT:
                    [x, y] = [7 * 8, 0];
                    break;
                case TileInterface_1.TILE.GOLD:
                    [x, y] = [11 * 8, 0];
                    break;
                case TileInterface_1.TILE.GROUND:
                    [x, y] = [13 * 8, 1 * 8];
                    break;
                default:
                    [x, y] = [0, 0];
                    break;
            }
            let [u, d, l, r] = [false, false, false, false];
            let [dl, dr, ul, ur] = [false, false, false, false];
            if (tile.interface.hasFaces) {
                let t;
                t = Tile.findByPosition(tile.x, tile.y - 1);
                u = (t instanceof Tile && !t.interface.isHigh);
                t = Tile.findByPosition(tile.x, tile.y + 1);
                d = (t instanceof Tile && !t.interface.isHigh);
                t = Tile.findByPosition(tile.x - 1, tile.y);
                l = (t instanceof Tile && !t.interface.isHigh);
                t = Tile.findByPosition(tile.x + 1, tile.y);
                r = (t instanceof Tile && !t.interface.isHigh);
                t = Tile.findByPosition(tile.x - 1, tile.y + 1);
                dl = (t instanceof Tile && !t.interface.isHigh);
                t = Tile.findByPosition(tile.x + 1, tile.y + 1);
                dr = (t instanceof Tile && !t.interface.isHigh);
                if (u && !d && !l && !r)
                    [x, y] = [6 * 8, 5 * 8];
                if (!u && d && !l && !r)
                    [x, y] = [4 * 8, 4 * 8];
                if (!u && !d && l && !r)
                    [x, y] = [4 * 8, 3 * 8];
                if (!u && !d && !l && r)
                    [x, y] = [5 * 8, 3 * 8];
                if (u && d && !l && !r)
                    [x, y] = [5 * 8, 1 * 8];
                if (!u && !d && l && r)
                    [x, y] = [4 * 8, 0 * 8];
                if (u && !d && !l && r)
                    [x, y] = [7 * 8, 3 * 8];
                if (u && !d && l && !r)
                    [x, y] = [7 * 8, 2 * 8];
                if (!u && d && !l && r)
                    [x, y] = [4 * 8, 2 * 8];
                if (!u && d && l && !r)
                    [x, y] = [4 * 8, 1 * 8];
                if (!u && d && l && r)
                    [x, y] = [5 * 8, 0 * 8];
                if (u && !d && l && r)
                    [x, y] = [4 * 8, 0 * 8];
                if (!u && !d && !l && !r) {
                    if (!ul && !ur && dl && !dr)
                        [x, y] = [6 * 8, 4 * 8];
                    if (!ul && !ur && dl && dr)
                        [x, y] = [5 * 8, 5 * 8];
                }
                if (u || d || l || r) {
                    if (tile.interface === TileInterface_1.TILE.BEDROCK)
                        y += 6 * 8;
                    if (tile.interface === TileInterface_1.TILE.GOLD)
                        x += 4 * 8;
                }
            }
            return new Sprite_1.Sprite(Sprite_1.spriteSheet, [[x, y, w, h]]);
        }
        static findByPosition(x, y) {
            for (let n = 0; n < Tile.instances.length; n++) {
                const tile = Tile.instances[n];
                if (tile.x === x && tile.y === y)
                    return tile;
            }
            return null;
        }
        static pathTo(a, b) {
            const path = [];
            const limit = 100;
            const visited = [];
            const next = [a];
            const values = [];
            let n = 0;
            let val = 0;
            values[a.id] = 1;
            while (next.length > 0) {
                if (n++ >= limit)
                    break;
                const c = next.shift();
                visited.push(c);
                if (c) {
                    if (c.interface.isHigh) {
                        values[c.id] = 1000000;
                    }
                    else {
                        const v = values[c.id];
                        const n = Tile.findByPosition(c.x, c.y - 1);
                        const s = Tile.findByPosition(c.x, c.y + 1);
                        const e = Tile.findByPosition(c.x + 1, c.y);
                        const w = Tile.findByPosition(c.x - 1, c.y);
                        if (n && !visited.includes(n) && !next.includes(n)) {
                            next.push(n);
                        }
                        if (s && !visited.includes(s) && !next.includes(s)) {
                            next.push(s);
                        }
                        if (e && !visited.includes(e) && !next.includes(e)) {
                            next.push(e);
                        }
                        if (w && !visited.includes(w) && !next.includes(w)) {
                            next.push(w);
                        }
                        if (n)
                            values[n.id] = Math.min(v + 1, values[n.id] || 1000000);
                        if (s)
                            values[s.id] = Math.min(v + 1, values[s.id] || 1000000);
                        if (e)
                            values[e.id] = Math.min(v + 1, values[e.id] || 1000000);
                        if (w)
                            values[w.id] = Math.min(v + 1, values[w.id] || 1000000);
                        if ([n, s, e, w].includes(b)) {
                            let p = c;
                            const lim = 100;
                            let i = 0;
                            while (p !== a) {
                                path.push(p);
                                if (i++ >= lim)
                                    break;
                                const n = Tile.findByPosition(p.x, p.y - 1);
                                const s = Tile.findByPosition(p.x, p.y + 1);
                                const e = Tile.findByPosition(p.x + 1, p.y);
                                const w = Tile.findByPosition(p.x - 1, p.y);
                                if (n && values[n.id] !== undefined && values[n.id] < values[p.id]) {
                                    p = n;
                                }
                                if (s && values[s.id] !== undefined && values[s.id] < values[p.id]) {
                                    p = s;
                                }
                                if (e && values[e.id] !== undefined && values[e.id] < values[p.id]) {
                                    p = e;
                                }
                                if (w && values[w.id] !== undefined && values[w.id] < values[p.id]) {
                                    p = w;
                                }
                            }
                        }
                    }
                }
            }
            path.reverse();
            return path;
        }
    }
    exports.Tile = Tile;
    Tile.id = 0;
    Tile.instances = [];
});
define("Map", ["require", "exports", "Array2D", "Tile", "TileInterface"], function (require, exports, Array2D_1, Tile_1, TileInterface_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Map = void 0;
    class Map {
        constructor(w, h) {
            this.loading = true;
            this._width = w;
            this._height = h;
            this.tiles = new Array2D_1.Array2D(w, h, new Tile_1.Tile(TileInterface_2.TILE.NULL, 0, 0));
        }
        get width() { return this._width; }
        get height() { return this._height; }
        get(x, y) {
            return this.tiles.get(x, y);
        }
        set(x, y, v) {
            this.tiles.set(x, y, v);
        }
        resize(w, h) {
            [this._width, this._height] = [w, h];
            this.tiles.resize(w, h);
        }
        load(src, callback) {
            const image = new Image();
            image.onload = () => {
                let out = {};
                const { width, height } = image;
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = width;
                canvas.height = height;
                context.drawImage(image, 0, 0);
                const imageData = context.getImageData(0, 0, width, height);
                const pixels = imageData.data;
                for (let n = 0, y = 0; y < this._height; y++)
                    for (let x = 0; x < this._width; x++, n += 4) {
                        const color = [pixels[n], pixels[n + 1], pixels[n + 2]];
                        const [r, g, b] = color;
                        switch (true) {
                            case (r === 0 && g === 255 && b === 0):
                                out.camX = x;
                                out.camY = y;
                                break;
                            default:
                                const type = Tile_1.Tile.tileFromColor(color);
                                const tile = new Tile_1.Tile(type, x, y);
                                this.set(x, y, tile);
                                break;
                        }
                    }
                Tile_1.Tile.instances.forEach(t => {
                    t.sprite = Tile_1.Tile.spriteFromType(t);
                });
                callback(out);
            };
            image.src = src;
        }
    }
    exports.Map = Map;
});
define("Mob", ["require", "exports", "Tile"], function (require, exports, Tile_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Mob = void 0;
    class Mob {
        constructor(type, x, y) {
            this.doingJob = false;
            this.interface = type;
            this.hp = type.hp;
            this.x = x;
            this.y = y;
            this.path = [];
            Mob.instances.push(this);
        }
        update() {
            if (this.doingJob) {
                if (this.job && !this.job.selected) {
                    this.job = null;
                    this.doingJob = false;
                    console.log("job cancelled!");
                }
                if (this.path) {
                    const t = this.path[0];
                    if (t) {
                        if (this.x != t.x)
                            this.x += Math.sign(t.x - this.x) * 1 / 8;
                        if (this.y != t.y)
                            this.y += Math.sign(t.y - this.y) * 1 / 8;
                        if (this.x === t.x && this.y === t.y) {
                            this.path.shift();
                        }
                    }
                }
            }
            if (!this.doingJob && this.interface.canDig) {
                const job = this.findJob();
            }
        }
        draw(ctx) {
            const i = ~~(performance.now() / 100) % 4;
            this.interface.sprite.draw(ctx, i, this.x * 8, this.y * 8);
        }
        findJob() {
            for (let n = 0; n < Tile_2.Tile.instances.length; n++) {
                const t = Tile_2.Tile.instances[n];
                const c = Tile_2.Tile.findByPosition(~~this.x, ~~this.y);
                if (t.selected && c) {
                    const path = Tile_2.Tile.pathTo(c, t);
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
        static drawAll(ctx) {
            Mob.instances.forEach(i => i.draw(ctx));
        }
    }
    exports.Mob = Mob;
    Mob.instances = [];
});
define("index", ["require", "exports", "Input", "Tile", "Sprite", "Map", "Mob"], function (require, exports, Input_1, Tile_3, Sprite_2, Map_1, Mob_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const cursor = new Sprite_2.Sprite(Sprite_2.spriteSheet, [[7 * 8, 7 * 8, 8, 12]]);
    const imp = {
        name: "Imp",
        sprite: new Sprite_2.Sprite(Sprite_2.spriteSheet, [
            [9 * 8, 6 * 8, 8, 8],
            [10 * 8, 6 * 8, 8, 8],
            [11 * 8, 6 * 8, 8, 8],
            [10 * 8, 6 * 8, 8, 8]
        ]),
        hp: 4,
        canDig: true
    };
    new Mob_1.Mob(imp, 30, 31);
    const horny = {
        sprite: new Sprite_2.Sprite(Sprite_2.spriteSheet, [[8 * 8, 6 * 8, 8, 12]]),
        x: 32,
        y: 32
    };
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    Input_1.keyboard.init();
    Input_1.mouse.init();
    const camera = {
        x: 0,
        y: 0
    };
    const map = new Map_1.Map(64, 64);
    map.load("../data/maps/test.png", (out) => {
        camera.x = out.camX;
        camera.y = out.camY;
    });
    let selectState = false;
    requestAnimationFrame(function loop() {
        const speed = 0.125;
        const down = Input_1.keyboard.down;
        if (down['w'] || down['W'] || down['ArrowUp'])
            camera.y -= speed;
        if (down['a'] || down['A'] || down['ArrowLeft'])
            camera.x -= speed;
        if (down['s'] || down['S'] || down['ArrowDown'])
            camera.y += speed;
        if (down['d'] || down['D'] || down['ArrowRight'])
            camera.x += speed;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        const cx = Math.round(-camera.x * 8);
        const cy = Math.round(-camera.y * 8);
        ctx.translate(cx + 32, cy + 32);
        Mob_1.Mob.updateAll();
        for (let x = Math.max(0, ~~camera.x - 4); x < Math.min(63, ~~camera.x + 5); x++)
            for (let y = Math.max(0, ~~camera.y - 4); y < Math.min(63, ~~camera.y + 5); y++) {
                map.get(x, y).draw(ctx);
            }
        Mob_1.Mob.drawAll(ctx);
        horny.sprite.draw(ctx, 0, horny.x * 8, horny.y * 8);
        const mX = ~~(Input_1.mouse.x / 10 / 8 + camera.x - 4);
        const mY = ~~(Input_1.mouse.y / 10 / 8 + camera.y - 4);
        ctx.strokeRect(mX * 8 + 0.5, mY * 8 + 0.5, 7, 7);
        if (Input_1.mouse.pressed[1]) {
            const tile = Tile_3.Tile.findByPosition(mX, mY);
            if (tile && tile.interface.minable) {
                tile.selected = !tile.selected;
                selectState = tile.selected;
            }
        }
        if (Input_1.mouse.down[1]) {
            const tile = Tile_3.Tile.findByPosition(mX, mY);
            if (tile && tile.interface.minable) {
                tile.selected = selectState;
            }
        }
        ctx.restore();
        cursor.draw(ctx, 0, Input_1.mouse.x / 10, Input_1.mouse.y / 10);
        Input_1.keyboard.update();
        Input_1.mouse.update();
        requestAnimationFrame(loop);
    });
});
//# sourceMappingURL=index.js.map