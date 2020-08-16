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
        forEach(f) {
            const w = this.width;
            const h = this.height;
            for (let y = 0; y < h; y++)
                for (let x = 0; x < w; x++) {
                    f(this.data[y][x]);
                }
        }
    }
    exports.Array2D = Array2D;
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
    exports.spriteSheet = new Texture_1.Texture('./img/bhts.png');
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
            const frame = this.frames[~~i % this.frames.length];
            frame.texture.draw(ctx, frame.x, frame.y, frame.w, frame.h, Math.round(x), Math.round(y), frame.w, frame.h);
        }
    }
    exports.Sprite = Sprite;
});
define("Creature", ["require", "exports", "Sprite"], function (require, exports, Sprite_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CREATURE = void 0;
    exports.CREATURE = {
        IMP: {
            name: "Imp",
            sprite: new Sprite_1.Sprite(Sprite_1.spriteSheet, [
                [9 * 8, 6 * 8, 8, 8],
                [10 * 8, 6 * 8, 8, 8],
                [11 * 8, 6 * 8, 8, 8],
                [10 * 8, 6 * 8, 8, 8]
            ]),
            hp: 4,
            canDig: true
        },
        GOBLIN: {
            name: "Goblin",
            sprite: new Sprite_1.Sprite(Sprite_1.spriteSheet, [
                [11 * 8, 5 * 8, 8, 8]
            ]),
            hp: 16,
            canDig: false
        }
    };
});
define("Input", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mouse = exports.keyboard = void 0;
    const canvas = document.getElementById('canvas');
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
            canvas.addEventListener('mousemove', e => {
                exports.mouse.x = e.offsetX;
                exports.mouse.y = e.offsetY;
            });
            canvas.addEventListener("mousedown", e => {
                if (!exports.mouse.down[e.which]) {
                    exports.mouse.pressed[e.which] = true;
                    exports.mouse.down[e.which] = true;
                }
            });
            canvas.addEventListener("mouseup", e => {
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
define("TileInterface", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TILE = void 0;
    exports.TILE = {
        NULL: { name: "NULL" },
        SPECIAL: { name: "SPECIAL" },
        GROUND: { name: "Ground" },
        FLOOR: { name: "Claimed Ground" },
        WALL: { name: "Wall", hasFaces: true, isHigh: true, minable: true },
        LAIR: { name: "Lair" },
        HATCHERY: { name: "Hatchery" },
        TREASURY: { name: "Treasury" },
        BEDROCK: { name: "Bedrock", hasFaces: true, isHigh: true },
        DIRT: { name: "Dirt", hasFaces: true, isHigh: true, minable: true },
        GOLD: { name: "Gold", hasFaces: true, isHigh: true, minable: true }
    };
});
define("Tile", ["require", "exports", "Sprite", "TileInterface"], function (require, exports, Sprite_2, TileInterface_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Tile = void 0;
    class Tile {
        constructor(i, x, y) {
            this.owner = 0;
            this.faces = 0b00000000;
            this.selected = false;
            this.partOf = 0;
            this.id = Tile.id++;
            this.x = x;
            this.y = y;
            this.interface = i;
            this.sprite = new Sprite_2.Sprite(Sprite_2.spriteSheet, [[0, 0, 8, 8]]);
            Tile.instances.push(this);
        }
        set(obj) {
            if (obj.owner)
                this.owner = obj.owner;
            if (obj.interface)
                this.interface = obj.interface;
            if (obj.sprite)
                this.sprite = obj.sprite;
            if (obj.partOf)
                this.partOf = obj.partOf;
        }
        draw(ctx) {
            if (this.interface === TileInterface_1.TILE.NULL) {
                return;
            }
            if (this.owner) {
                ctx.fillStyle = "#911A1A";
                ctx.fillRect(this.x * 8, this.y * 8, 8, 8);
            }
            if (this.sprite) {
                this.sprite.draw(ctx, performance.now() / 100, this.x * 8, this.y * 8);
            }
            if (this.selected) {
                ctx.fillStyle = "#FFFF00";
                ctx.globalAlpha = 0.75 + Math.sin(performance.now() / 250) * 0.25;
                ctx.fillRect(this.x * 8, this.y * 8, 8, 8);
                ctx.globalAlpha = 1;
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
            if (tile.interface === TileInterface_1.TILE.SPECIAL)
                return tile.sprite;
            let [x, y, w, h] = [0, 0, 8, 8];
            switch (tile.interface) {
                case TileInterface_1.TILE.BEDROCK:
                    [x, y] = [7 * 8, 6 * 8];
                    break;
                case TileInterface_1.TILE.DIRT:
                    [x, y] = [7 * 8, 0];
                    break;
                case TileInterface_1.TILE.FLOOR:
                    [x, y] = [11 * 8, 1 * 8];
                    break;
                case TileInterface_1.TILE.GOLD:
                    [x, y] = [11 * 8, 0];
                    break;
                case TileInterface_1.TILE.GROUND:
                    [x, y] = [13 * 8, 1 * 8];
                    break;
                case TileInterface_1.TILE.LAIR:
                    [x, y] = [12 * 8, 0];
                    break;
                case TileInterface_1.TILE.HATCHERY:
                    [x, y] = [13 * 8, 0];
                    break;
                case TileInterface_1.TILE.TREASURY:
                    [x, y] = [14 * 8, 0];
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
                if (u && d && l && !r)
                    [x, y] = [6 * 8, 2 * 8];
                if (u && d && !l && r)
                    [x, y] = [4 * 8, 2 * 8];
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
                    if (tile.interface === TileInterface_1.TILE.WALL)
                        x -= 4 * 8;
                }
            }
            return new Sprite_2.Sprite(Sprite_2.spriteSheet, [[x, y, w, h]]);
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
            const neighbours = Tile.getNeighbours(b);
            if (neighbours.every(t => t && t.interface.isHigh))
                return null;
            const visited = [];
            const next = [a];
            const values = [];
            let val = 0;
            values[a.id] = 1;
            while (next.length > 0) {
                const c = next.shift();
                visited.push(c);
                if (c) {
                    if (c.interface.isHigh) {
                        values[c.id] = 1000000;
                    }
                    else {
                        const v = values[c.id];
                        const neighbours = Tile.getNeighbours(c);
                        const [n, e, s, w] = neighbours;
                        if (n && !visited.includes(n) && !next.includes(n))
                            next.push(n);
                        if (s && !visited.includes(s) && !next.includes(s))
                            next.push(s);
                        if (e && !visited.includes(e) && !next.includes(e))
                            next.push(e);
                        if (w && !visited.includes(w) && !next.includes(w))
                            next.push(w);
                        if (n)
                            values[n.id] = Math.min(v + 1, values[n.id] || 1000000);
                        if (s)
                            values[s.id] = Math.min(v + 1, values[s.id] || 1000000);
                        if (e)
                            values[e.id] = Math.min(v + 1, values[e.id] || 1000000);
                        if (w)
                            values[w.id] = Math.min(v + 1, values[w.id] || 1000000);
                        if (neighbours.includes(b)) {
                            const path = [];
                            if (!b.interface.isHigh)
                                path.push(b);
                            let p = c;
                            while (p !== a) {
                                path.push(p);
                                const [n, e, s, w] = Tile.getNeighbours(p);
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
                            path.reverse();
                            return path;
                        }
                    }
                }
            }
            return null;
        }
        static getNeighbours(t) {
            return [
                Tile.findByPosition(t.x, t.y - 1),
                Tile.findByPosition(t.x, t.y + 1),
                Tile.findByPosition(t.x + 1, t.y),
                Tile.findByPosition(t.x - 1, t.y)
            ];
        }
    }
    exports.Tile = Tile;
    Tile.id = 0;
    Tile.instances = [];
});
define("Sound", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Sound = void 0;
    class Sound {
        constructor(src, count = 1, volume = 1) {
            this.count = count;
            this.audioArray = [];
            for (let n = 0; n < count; n++) {
                const a = new Audio(src);
                a.volume = volume;
                this.audioArray.push(a);
            }
        }
        play(loop = false) {
            if (!Sound.enabled)
                return;
            for (let n = 0; n < this.count; n++) {
                const inst = this.audioArray[n];
                if (inst.paused) {
                    inst.loop = loop;
                    inst.play();
                    return inst;
                }
            }
        }
    }
    exports.Sound = Sound;
    Sound.enabled = true;
});
define("Mob", ["require", "exports", "Sound", "Tile", "TileInterface", "Map"], function (require, exports, Sound_1, Tile_1, TileInterface_2, Map_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Mob = void 0;
    const jobs = [];
    const sfxHit = [
        new Sound_1.Sound("./data/sfx/hit1.wav", 5),
        new Sound_1.Sound("./data/sfx/hit2.wav", 5)
    ];
    class Mob {
        constructor(type, x, y) {
            this.doingJob = false;
            this.jobProgress = 0;
            this.brainTick = 0;
            this.brainMax = 64;
            this.speed = 1 / 16;
            this.interface = type;
            this.hp = type.hp;
            this.x = x;
            this.y = y;
            this.path = [];
            Mob.instances.push(this);
        }
        update(map) {
            if (this.doingJob) {
                if (this.path.length > 0) {
                    const t = this.path[0];
                    const s = this.speed;
                    if (t) {
                        if (this.x != t.x)
                            this.x += Math.sign(t.x - this.x) * s;
                        if (this.y != t.y)
                            this.y += Math.sign(t.y - this.y) * s;
                        if (this.x === t.x && this.y === t.y) {
                            this.path.shift();
                        }
                    }
                }
                else if (this.job) {
                    if (this.jobProgress++ < 20)
                        return;
                    this.jobProgress = 0;
                    if (this.job.interface.isHigh) {
                        if (this.job.selected) {
                            this.job.interface = TileInterface_2.TILE.GROUND;
                            this.job.selected = false;
                            this.job.owner = 0;
                            sfxHit[~~(Math.random() + 1)].play();
                        }
                        else {
                            this.job.interface = TileInterface_2.TILE.WALL;
                            this.job.owner = 1;
                            this.job.selected = false;
                        }
                    }
                    else {
                        const job = this.job;
                        if (job.partOf !== 0) {
                            const building = Map_1.Map.buildings.find(e => e.id === job.partOf);
                            building.owner = 1;
                            const o = { owner: 1 };
                            let n = 0;
                            map.tiles.forEach((t) => {
                                if (job && t.partOf === job.partOf) {
                                    t.set(o);
                                    n++;
                                }
                            });
                        }
                        else {
                            const o = { interface: TileInterface_2.TILE.FLOOR, owner: 1 };
                            job.set(o);
                        }
                    }
                    const tiles = Tile_1.Tile.getNeighbours(this.job);
                    this.job.selected = false;
                    tiles.push(this.job);
                    tiles.forEach(t => {
                        if (t)
                            t.sprite = Tile_1.Tile.spriteFromType(t);
                    });
                    const i = jobs.indexOf(this.job);
                    jobs.splice(i, 1);
                    this.job = null;
                    this.doingJob = false;
                }
            }
            else {
                if (!this.path || this.path.length === 0) {
                    const c = map.get(~~this.x, ~~this.y);
                    const filtered = [];
                    map.tiles.forEach((t) => {
                        if (!t.interface.isHigh && t.owner === 1) {
                            filtered.push(t);
                        }
                    });
                    const i = ~~(Math.random() * filtered.length);
                    const t = filtered[i];
                    if (t) {
                        this.path = Tile_1.Tile.pathTo(c, t);
                    }
                }
                else {
                    if (this.path.length > 0) {
                        const t = this.path[0];
                        const s = this.speed;
                        if (t) {
                            if (this.x != t.x)
                                this.x += Math.sign(t.x - this.x) * s;
                            if (this.y != t.y)
                                this.y += Math.sign(t.y - this.y) * s;
                            if (this.x === t.x && this.y === t.y) {
                                this.path.shift();
                            }
                        }
                    }
                }
            }
            if (!this.doingJob && this.interface.canDig) {
                this.findJob(map);
            }
        }
        draw(ctx) {
            const i = ~~(performance.now() / 100) % 4;
            this.interface.sprite.draw(ctx, i, this.x * 8, this.y * 8);
        }
        findJob(map) {
            const tiles = Tile_1.Tile.instances;
            this.brainTick = this.brainTick % tiles.length;
            const start = this.brainTick;
            const max = ~~(Math.random() * this.brainMax);
            const end = Math.min(this.brainTick + this.brainMax, tiles.length);
            for (let n = start; n < end; this.brainTick++, n++) {
                const t = tiles[n];
                const c = map.get(~~this.x, ~~this.y);
                if (jobs.includes(t))
                    continue;
                if (t.selected) {
                    if (c) {
                        const path = Tile_1.Tile.pathTo(c, t);
                        if (path !== null) {
                            this.takeJob(t, path);
                            break;
                        }
                    }
                }
                if (t.interface === TileInterface_2.TILE.GROUND) {
                    const neighbours = Tile_1.Tile.getNeighbours(t);
                    if (neighbours.some(t => t && !t.interface.isHigh && t.owner === 1)) {
                        const path = Tile_1.Tile.pathTo(c, t);
                        if (path !== null) {
                            this.takeJob(t, path);
                            break;
                        }
                    }
                }
                if (t.partOf !== 0 && t.owner !== 1) {
                    const neighbours = Tile_1.Tile.getNeighbours(t);
                    if (neighbours.some(t => t && !t.interface.isHigh && t.owner === 1)) {
                        const path = Tile_1.Tile.pathTo(c, t);
                        if (path !== null) {
                            this.takeJob(t, path);
                            break;
                        }
                    }
                }
                if (t.interface === TileInterface_2.TILE.DIRT) {
                    const neighbours = Tile_1.Tile.getNeighbours(t);
                    if (neighbours.some(t => t && !t.interface.isHigh && t.owner === 1)) {
                        const path = Tile_1.Tile.pathTo(c, t);
                        if (path !== null) {
                            this.takeJob(t, path);
                            break;
                        }
                    }
                }
            }
        }
        takeJob(t, path) {
            this.job = t;
            this.doingJob = true;
            this.path = path;
            jobs.push(t);
        }
        static updateAll(map) {
            Mob.instances.forEach(i => i.update(map));
        }
        static drawAll(ctx) {
            Mob.instances.forEach(i => i.draw(ctx));
        }
    }
    exports.Mob = Mob;
    Mob.instances = [];
});
define("Map", ["require", "exports", "Array2D", "Tile", "TileInterface", "Sprite", "Mob", "Creature"], function (require, exports, Array2D_1, Tile_2, TileInterface_3, Sprite_3, Mob_1, Creature_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Map = void 0;
    const dungeonHeart = new Sprite_3.Sprite(Sprite_3.spriteSheet, [
        [13 * 8, 2 * 8, 24, 24],
        [13 * 8, 5 * 8, 24, 24],
        [13 * 8, 8 * 8, 24, 24],
        [13 * 8, 5 * 8, 24, 24]
    ]);
    const portal = new Sprite_3.Sprite(Sprite_3.spriteSheet, [
        [13 * 8, 11 * 8, 24, 24]
    ]);
    const heroGate = new Sprite_3.Sprite(Sprite_3.spriteSheet, [
        [10 * 8, 11 * 8, 24, 24]
    ]);
    class Map {
        constructor(w, h) {
            this.loading = true;
            this._width = w;
            this._height = h;
            this.tiles = new Array2D_1.Array2D(w, h, new Tile_2.Tile(TileInterface_3.TILE.NULL, 0, 0));
        }
        get width() { return this._width; }
        get height() { return this._height; }
        get(x, y) {
            return this.tiles.get(x, y);
        }
        set(x, y, v) {
            this.tiles.set(x, y, v);
        }
        setArea(x1, y1, x2, y2, obj) {
            for (let x = x1; x <= x2; x++)
                for (let y = y1; y <= y2; y++) {
                    this.get(x, y).set(obj);
                }
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
                for (let n = 0, y = 0; y < height; y++)
                    for (let x = 0; x < width; x++, n += 4) {
                        const color = [pixels[n], pixels[n + 1], pixels[n + 2]];
                        const [r, g, b] = color;
                        switch (true) {
                            default:
                                const type = Tile_2.Tile.tileFromColor(color);
                                const tile = new Tile_2.Tile(type, x, y);
                                this.set(x, y, tile);
                                break;
                        }
                    }
                for (let n = 0, y = 0; y < height; y++)
                    for (let x = 0; x < width; x++, n += 4) {
                        const color = [pixels[n], pixels[n + 1], pixels[n + 2]];
                        const [r, g, b] = color;
                        let i;
                        switch (true) {
                            case (r === 0 && g === 255 && b === 0):
                                out.camX = x;
                                out.camY = y;
                                i = Map.getNewBuilding("Dungeon Heart", 1);
                                this.setArea(x - 2, y - 2, x + 2, y + 2, { interface: TileInterface_3.TILE.TREASURY, owner: 1 });
                                this.setArea(x - 1, y - 1, x + 1, y + 1, { interface: TileInterface_3.TILE.NULL, partOf: i, owner: 1 });
                                this.setArea(x - 1, y - 1, x - 1, y - 1, { interface: TileInterface_3.TILE.SPECIAL, sprite: dungeonHeart });
                                new Mob_1.Mob(Creature_1.CREATURE.IMP, x - 2, y - 1);
                                new Mob_1.Mob(Creature_1.CREATURE.IMP, x - 2, y + 1);
                                new Mob_1.Mob(Creature_1.CREATURE.IMP, x + 2, y - 1);
                                new Mob_1.Mob(Creature_1.CREATURE.IMP, x + 2, y + 1);
                                break;
                            case (r === 0 && g === 0 && b === 255):
                                i = Map.getNewBuilding("Portal", 0);
                                this.setArea(x - 1, y - 1, x + 1, y + 1, { interface: TileInterface_3.TILE.NULL, partOf: i, owner: 0 });
                                this.setArea(x - 1, y - 1, x - 1, y - 1, { interface: TileInterface_3.TILE.SPECIAL, sprite: portal });
                                break;
                            case (r === 255 && g === 0 && b === 255):
                                i = Map.getNewBuilding("Hero Gate", 0);
                                this.setArea(x - 1, y - 1, x + 1, y + 1, { interface: TileInterface_3.TILE.NULL, partOf: i, owner: 2 });
                                this.setArea(x - 1, y - 1, x - 1, y - 1, { interface: TileInterface_3.TILE.SPECIAL, sprite: heroGate });
                                break;
                        }
                    }
                Tile_2.Tile.instances.forEach(t => {
                    t.sprite = Tile_2.Tile.spriteFromType(t);
                });
                callback(out);
            };
            image.src = src;
        }
        static getNewBuilding(name, owner) {
            Map.buildings.push({
                id: Map.buildingID,
                name: name,
                owner: owner
            });
            return Map.buildingID++;
        }
        static getBuilding(t) {
            return Map.buildings.find(b => t.partOf === b.id);
        }
    }
    exports.Map = Map;
    Map.buildingID = 1;
    Map.buildings = [];
});
define("Lighting", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.lightingUpdate = exports.lightingContext = exports.lightingCanvas = void 0;
    exports.lightingCanvas = document.createElement('canvas');
    exports.lightingContext = exports.lightingCanvas.getContext('2d');
    exports.lightingCanvas.width = 64;
    exports.lightingCanvas.height = 64;
    const lightColors = [];
    function lightingUpdate(map, x, y) {
        exports.lightingContext.fillStyle = '#000000';
        exports.lightingContext.fillRect(0, 0, 64, 64);
        exports.lightingContext.fillStyle = '#ff567c';
        exports.lightingContext.beginPath();
        for (let x = 0; x < map.width; x += 3)
            for (let y = 0; y < map.height; y += 3) {
                const t = map.get(x, y);
                if (t && t.owner !== 0) {
                    exports.lightingContext.moveTo(x + 0.5, y);
                    exports.lightingContext.ellipse(x + 0.5, y, 1.5, 1.5, 0, 0, Math.PI * 2);
                }
            }
        exports.lightingContext.fill();
        exports.lightingContext.beginPath();
        exports.lightingContext.fillStyle = '#ffffff';
        exports.lightingContext.moveTo(x + 0.5, y);
        exports.lightingContext.ellipse(x + 0.5, y, 3.5, 3.5, 0, 0, Math.PI * 2);
        exports.lightingContext.fill();
    }
    exports.lightingUpdate = lightingUpdate;
});
define("index", ["require", "exports", "Input", "Tile", "TileInterface", "Sprite", "Map", "Mob", "Sound", "Lighting", "Creature"], function (require, exports, Input_1, Tile_3, TileInterface_4, Sprite_4, Map_2, Mob_2, Sound_2, Lighting_1, Creature_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let mX, mY;
    let gameState = "MENU";
    let overGUI = false;
    let building = false;
    let buildingType;
    let buildingID = 0;
    let displayText = "";
    let cursorIndex = 1;
    let attractCreatureTimer = 60;
    let gold = 5000;
    const music = new Sound_2.Sound("./data/music/Sanctuary.mp3", 1, 0.5);
    const musBackground = new Sound_2.Sound("./data/music/ambient.mp3");
    const musAmbient2 = new Sound_2.Sound("./data/music/dungeon_ambient_1.ogg");
    setTimeout(() => {
        music.play(true);
        musBackground.play(true);
        musAmbient2.play(true);
    }, 1000);
    const sfxDig = new Sound_2.Sound("./data/sfx/dig.wav", 10, 0.5);
    const sprGold = new Sprite_4.Sprite(Sprite_4.spriteSheet, [[11 * 8, 4 * 8, 8, 8]]);
    const hudGold = new Sprite_4.Sprite(Sprite_4.spriteSheet, [[15 * 8 + 4, 0 * 8, 8, 8]]);
    const icons = [
        new Sprite_4.Sprite(Sprite_4.spriteSheet, [[11 * 8, 2 * 8, 8, 8]]),
        new Sprite_4.Sprite(Sprite_4.spriteSheet, [[0 * 8, 12 * 8, 8, 8]]),
        new Sprite_4.Sprite(Sprite_4.spriteSheet, [[1 * 8, 12 * 8, 8, 8]]),
        new Sprite_4.Sprite(Sprite_4.spriteSheet, [[2 * 8, 12 * 8, 8, 8]]),
    ];
    const cursor = new Sprite_4.Sprite(Sprite_4.spriteSheet, [
        [7 * 8, 7 * 8, 8, 8],
        [7 * 8, 8 * 8, 8, 8],
        [7 * 8, 9 * 8, 8, 8]
    ]);
    const horny = {
        sprite: new Sprite_4.Sprite(Sprite_4.spriteSheet, [[8 * 8, 6 * 8, 8, 12]]),
        x: 32,
        y: 32
    };
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    Input_1.keyboard.init();
    Input_1.mouse.init();
    const camera = {
        x: 0,
        y: 0
    };
    const map = new Map_2.Map(64, 64);
    map.load("./data/maps/test.png", (out) => {
        camera.x = out.camX;
        camera.y = out.camY;
    });
    let selectState = false;
    let pDelta = 0;
    let fpsMax = 60;
    let requestId;
    (function loop(time) {
        const delta = time - pDelta;
        if (fpsMax && delta < 1000 / fpsMax)
            return;
        pDelta = delta;
        updateCamera();
        mX = ~~(Input_1.mouse.x / 10 / 8 + camera.x - 4);
        mY = ~~(Input_1.mouse.y / 10 / 8 + camera.y - 4);
        updateGUI();
        Mob_2.Mob.updateAll(map);
        updateGame();
        drawGame();
        if (!overGUI) {
            const tile = Tile_3.Tile.findByPosition(mX, mY);
            if (tile) {
                if (tile.partOf) {
                    const building = Map_2.Map.buildings.find(e => e.id === tile.partOf);
                    if (building)
                        displayText = building.name;
                }
                else {
                    displayText = tile.interface.name;
                }
                if (Input_1.mouse.pressed[3]) {
                    building = false;
                    console.log("cancel building");
                }
                if (Input_1.mouse.pressed[1]) {
                    if (building && buildingType) {
                        buildingID = Map_2.Map.getNewBuilding(buildingType.name, 1);
                    }
                    else if (tile.interface.minable) {
                        tile.selected = !tile.selected;
                        selectState = tile.selected;
                        sfxDig.play();
                    }
                }
                if (Input_1.mouse.down[1]) {
                    if (building) {
                        if (tile.interface === TileInterface_4.TILE.FLOOR && tile.owner === 1) {
                            tile.set({ interface: buildingType });
                            tile.sprite = Tile_3.Tile.spriteFromType(tile);
                        }
                    }
                    else if (tile.interface.minable) {
                        if (tile.selected !== selectState) {
                            tile.selected = selectState;
                            sfxDig.play();
                        }
                    }
                }
            }
        }
        ctx.restore();
        drawGUI();
        cursor.draw(ctx, cursorIndex, Input_1.mouse.x / 10, Input_1.mouse.y / 10);
        Input_1.keyboard.update();
        Input_1.mouse.update();
        requestId = requestAnimationFrame(loop);
    })();
    function hasBuilding(name) {
        for (let n = 0; n < Map_2.Map.buildings.length; n++) {
            const b = Map_2.Map.buildings[n];
            if (b.name === name && b.owner === 1) {
                return true;
            }
        }
        return false;
    }
    function updateGame() {
        if (attractCreatureTimer++ > 60 && hasBuilding('Portal')) {
            attractCreatureTimer = 0;
            if (hasBuilding('Lair') && hasBuilding('Hatchery')) {
                let lairCount = 0;
                map.tiles.forEach((t) => {
                    if (t.interface.name === "Lair")
                        lairCount++;
                });
                let goblinCount = 0;
                Mob_2.Mob.instances.forEach(m => {
                    if (m.interface.name === "Goblin")
                        goblinCount++;
                });
                if (lairCount > goblinCount) {
                    let x = 0, y = 0;
                    map.tiles.forEach((t) => {
                        const b = Map_2.Map.getBuilding(t);
                        if (b && b.name === "Portal")
                            [x, y] = [t.x, t.y];
                    });
                    console.log("spawn goblin", x, y);
                    new Mob_2.Mob(Creature_2.CREATURE.GOBLIN, x, y);
                }
            }
        }
    }
    function drawGame() {
        for (let x = Math.max(0, ~~camera.x - 6); x < Math.min(63, ~~camera.x + 5); x++)
            for (let y = Math.max(0, ~~camera.y - 6); y < Math.min(63, ~~camera.y + 5); y++) {
                map.get(x, y).draw(ctx);
            }
        Mob_2.Mob.drawAll(ctx);
        horny.sprite.draw(ctx, 0, horny.x * 8, horny.y * 8);
        Lighting_1.lightingUpdate(map, mX, mY);
        ctx.globalAlpha = 0.9;
        ctx.globalCompositeOperation = 'multiply';
        ctx.drawImage(Lighting_1.lightingCanvas, 0, 0, 64, 64, 0, 0, 512, 512);
        ctx.globalAlpha = 1.0;
        ctx.strokeRect(mX * 8 + 0.5, mY * 8 + 0.5, 7, 7);
    }
    const buttons = [
        "",
        "Lair",
        "Hatchery",
        "Treasury"
    ];
    function updateGUI() {
        overGUI = false;
        displayText = "";
        cursorIndex = building ? 2 : 1;
        const mx = ~~(Input_1.mouse.x / 10);
        const my = ~~(Input_1.mouse.y / 10);
        if (my > 54) {
            cursorIndex = 0;
            overGUI = true;
        }
        for (let n = 0; n < 7; n++) {
            if (mx > (1 + n * 9) && mx < (1 + n * 9 + 8) && my > 55 && my < 63) {
                displayText = buttons[n];
                if (Input_1.mouse.pressed[1]) {
                    switch (displayText) {
                        case "Lair":
                            setBuildTemplate(TileInterface_4.TILE.LAIR);
                            break;
                        case "Hatchery":
                            setBuildTemplate(TileInterface_4.TILE.HATCHERY);
                            break;
                        case "Treasury":
                            setBuildTemplate(TileInterface_4.TILE.TREASURY);
                            break;
                    }
                }
            }
        }
    }
    function drawGUI() {
        for (let n = 0; n < 7; n++) {
            const i = icons[n] === undefined ? 0 : n;
            icons[i].draw(ctx, 0, 1 + n * 9, 55);
        }
        hudGold.draw(ctx, 0, 1, 1);
        drawText(gold.toString(), 6, 5, 0);
        ctx.fillStyle = "#ffc700";
        ctx.font = "4px Ikkle4";
        if (displayText)
            drawText(displayText, 32, 54);
    }
    function setBuildTemplate(type) {
        building = true;
        buildingType = type;
    }
    function drawText(t, x, y, align = 1) {
        const words = t.split(" ");
        let length = (words.length - 1) * 4;
        words.forEach(w => {
            length += ctx.measureText(w).width;
        });
        let dx = align ? x - (~~(length / 2)) : x;
        words.forEach(w => {
            ctx.fillText(w, dx, y);
            dx += ctx.measureText(w).width + 4;
        });
    }
    function updateCamera() {
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
        if (camera.x < 0)
            camera.x = 0;
        if (camera.x > 32)
            camera.x = 32;
        if (camera.y < 0)
            camera.y = 0;
        if (camera.y > 32)
            camera.y = 32;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        const cx = Math.round(-camera.x * 8);
        const cy = Math.round(-camera.y * 8);
        ctx.translate(cx + 32, cy + 32);
    }
});
//# sourceMappingURL=index.js.map