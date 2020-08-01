define("Array2D", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Array2D = void 0;
    var Array2D = (function () {
        function Array2D(w, h, fill) {
            this.width = 0;
            this.height = 0;
            this.data = [];
            this.fill = fill;
            this.width = w;
            this.height = h;
            this.clear(this.fill);
        }
        Array2D.prototype.get = function (x, y) {
            return this.data[x][y];
        };
        Array2D.prototype.set = function (x, y, v) {
            this.data[x][y] = v;
        };
        Array2D.prototype.size = function () {
            return [this.width, this.height];
        };
        Array2D.prototype.resize = function (w, h) {
            this.width = w;
            this.height = h;
            this.clear(this.fill);
        };
        Array2D.prototype.clear = function (v) {
            var w = this.width;
            var h = this.height;
            this.data.length = h;
            for (var y = 0; y < h; y++) {
                this.data[y] = this.data[y] || [];
                this.data[y].length = w;
                for (var x = 0; x < w; x++) {
                    this.data[y][x] = this.data[y][x] || this.fill;
                }
            }
        };
        return Array2D;
    }());
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
        init: function () {
            document.addEventListener('keydown', function (event) {
                if (!exports.keyboard.down[event.key]) {
                    exports.keyboard.pressed[event.key] = true;
                    exports.keyboard.down[event.key] = true;
                }
            });
            document.addEventListener('keyup', function (event) {
                if (exports.keyboard.down[event.key]) {
                    exports.keyboard.released[event.key] = true;
                    exports.keyboard.down[event.key] = false;
                }
            });
        },
        update: function () {
            for (var p in exports.keyboard.down) {
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
        init: function () {
            document.addEventListener('mousemove', function (e) {
                exports.mouse.x = e.offsetX;
                exports.mouse.y = e.offsetY;
            });
            document.addEventListener("mousedown", function (e) {
                if (!exports.mouse.down[e.which]) {
                    exports.mouse.pressed[e.which] = true;
                    exports.mouse.down[e.which] = true;
                }
            });
            document.addEventListener("mouseup", function (e) {
                if (exports.mouse.down[e.which]) {
                    exports.mouse.released[e.which] = true;
                    exports.mouse.down[e.which] = false;
                }
            });
        },
        update: function () {
            for (var n = 0; n < exports.mouse.pressed.length; n++) {
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
    var Texture = (function () {
        function Texture(src) {
            this.image = new Image();
            this.image.src = src;
        }
        Texture.prototype.draw = function (ctx, sx, sy, sw, sh, dx, dy, dw, dh) {
            ctx.drawImage(this.image, sx, sy, sw, sh, dx, dy, dw, dh);
        };
        return Texture;
    }());
    exports.Texture = Texture;
});
define("Sprite", ["require", "exports", "Texture"], function (require, exports, Texture_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Sprite = exports.spriteSheet = void 0;
    exports.spriteSheet = new Texture_1.Texture('../img/bhts.png');
    var Sprite = (function () {
        function Sprite(texture, x, y, w, h) {
            this.texture = texture;
            this.x = x;
            this.y = y;
            this.w = w;
            this.h = h;
        }
        Sprite.prototype.draw = function (ctx, x, y) {
            this.texture.draw(ctx, this.x, this.y, this.w, this.h, Math.round(x), Math.round(y), this.w, this.h);
        };
        return Sprite;
    }());
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
    var Tile = (function () {
        function Tile(i, x, y) {
            this.faces = 0;
            this.selected = false;
            this.x = x;
            this.y = y;
            this.interface = i;
            this.sprite = new Sprite_1.Sprite(Sprite_1.spriteSheet, 0, 0, 8, 8);
            Tile.instances.push(this);
        }
        Tile.prototype.draw = function (ctx) {
            if (this.sprite) {
                this.sprite.draw(ctx, this.x * 8, this.y * 8);
                if (this.selected) {
                    ctx.fillStyle = "#FFFF00";
                    ctx.globalAlpha = 0.75 + Math.sin(performance.now() / 250) * 0.25;
                    ctx.fillRect(this.x * 8, this.y * 8, 8, 8);
                    ctx.globalAlpha = 1;
                }
            }
        };
        Tile.tileFromColor = function (color) {
            var r = color[0], g = color[1], b = color[2];
            switch (true) {
                case (r === 255 && g === 0 && b === 0): return TileInterface_1.TILE.BEDROCK;
                case (r === 255 && g === 100 && b === 0): return TileInterface_1.TILE.DIRT;
                case (r === 255 && g === 255 && b === 255): return TileInterface_1.TILE.GROUND;
                case (r === 255 && g === 255 && b === 0): return TileInterface_1.TILE.GOLD;
                default: return TileInterface_1.TILE.BEDROCK;
            }
        };
        Tile.spriteFromType = function (tile) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
            var _v = [0, 0, 8, 8], x = _v[0], y = _v[1], w = _v[2], h = _v[3];
            switch (tile.interface) {
                case TileInterface_1.TILE.BEDROCK:
                    _a = [7 * 8, 6 * 8], x = _a[0], y = _a[1];
                    break;
                case TileInterface_1.TILE.DIRT:
                    _b = [7 * 8, 0], x = _b[0], y = _b[1];
                    break;
                case TileInterface_1.TILE.GOLD:
                    _c = [11 * 8, 0], x = _c[0], y = _c[1];
                    break;
                case TileInterface_1.TILE.GROUND:
                    _d = [13 * 8, 1 * 8], x = _d[0], y = _d[1];
                    break;
                default:
                    _e = [0, 0], x = _e[0], y = _e[1];
                    break;
            }
            var _w = [false, false, false, false], u = _w[0], d = _w[1], l = _w[2], r = _w[3];
            var _x = [false, false, false, false], dl = _x[0], dr = _x[1], ul = _x[2], ur = _x[3];
            if (tile.interface.hasFaces) {
                var t = void 0;
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
                    _f = [6 * 8, 5 * 8], x = _f[0], y = _f[1];
                if (!u && d && !l && !r)
                    _g = [4 * 8, 4 * 8], x = _g[0], y = _g[1];
                if (!u && !d && l && !r)
                    _h = [4 * 8, 3 * 8], x = _h[0], y = _h[1];
                if (!u && !d && !l && r)
                    _j = [5 * 8, 3 * 8], x = _j[0], y = _j[1];
                if (u && d && !l && !r)
                    _k = [5 * 8, 1 * 8], x = _k[0], y = _k[1];
                if (!u && !d && l && r)
                    _l = [4 * 8, 0 * 8], x = _l[0], y = _l[1];
                if (u && !d && !l && r)
                    _m = [7 * 8, 3 * 8], x = _m[0], y = _m[1];
                if (u && !d && l && !r)
                    _o = [7 * 8, 2 * 8], x = _o[0], y = _o[1];
                if (!u && d && !l && r)
                    _p = [4 * 8, 2 * 8], x = _p[0], y = _p[1];
                if (!u && d && l && !r)
                    _q = [4 * 8, 1 * 8], x = _q[0], y = _q[1];
                if (!u && d && l && r)
                    _r = [5 * 8, 0 * 8], x = _r[0], y = _r[1];
                if (u && !d && l && r)
                    _s = [4 * 8, 0 * 8], x = _s[0], y = _s[1];
                if (!u && !d && !l && !r) {
                    if (!ul && !ur && dl && !dr)
                        _t = [6 * 8, 4 * 8], x = _t[0], y = _t[1];
                    if (!ul && !ur && dl && dr)
                        _u = [5 * 8, 5 * 8], x = _u[0], y = _u[1];
                }
                if (u || d || l || r) {
                    if (tile.interface === TileInterface_1.TILE.BEDROCK)
                        y += 6 * 8;
                    if (tile.interface === TileInterface_1.TILE.GOLD)
                        x += 4 * 8;
                }
            }
            return new Sprite_1.Sprite(Sprite_1.spriteSheet, x, y, w, h);
        };
        Tile.findByPosition = function (x, y) {
            for (var n = 0; n < Tile.instances.length; n++) {
                var tile = Tile.instances[n];
                if (tile.x === x && tile.y === y)
                    return tile;
            }
            return null;
        };
        Tile.instances = [];
        return Tile;
    }());
    exports.Tile = Tile;
});
define("Map", ["require", "exports", "Array2D", "Tile", "TileInterface"], function (require, exports, Array2D_1, Tile_1, TileInterface_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Map = void 0;
    var Map = (function () {
        function Map(w, h) {
            this.loading = true;
            this._width = w;
            this._height = h;
            this.tiles = new Array2D_1.Array2D(w, h, new Tile_1.Tile(TileInterface_2.TILE.NULL, 0, 0));
        }
        Object.defineProperty(Map.prototype, "width", {
            get: function () { return this._width; },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Map.prototype, "height", {
            get: function () { return this._height; },
            enumerable: false,
            configurable: true
        });
        Map.prototype.get = function (x, y) {
            return this.tiles.get(x, y);
        };
        Map.prototype.set = function (x, y, v) {
            this.tiles.set(x, y, v);
        };
        Map.prototype.resize = function (w, h) {
            var _a;
            _a = [w, h], this._width = _a[0], this._height = _a[1];
            this.tiles.resize(w, h);
        };
        Map.prototype.load = function (src, callback) {
            var _this = this;
            var image = new Image();
            image.onload = function () {
                var out = {};
                var width = image.width, height = image.height;
                var canvas = document.createElement('canvas');
                var context = canvas.getContext('2d');
                canvas.width = width;
                canvas.height = height;
                context.drawImage(image, 0, 0);
                var imageData = context.getImageData(0, 0, width, height);
                var pixels = imageData.data;
                for (var n = 0, y = 0; y < _this._height; y++)
                    for (var x = 0; x < _this._width; x++, n += 4) {
                        var color = [pixels[n], pixels[n + 1], pixels[n + 2]];
                        var r = color[0], g = color[1], b = color[2];
                        switch (true) {
                            case (r === 0 && g === 255 && b === 0):
                                out.camX = x;
                                out.camY = y;
                                break;
                            default:
                                var type = Tile_1.Tile.tileFromColor(color);
                                var tile = new Tile_1.Tile(type, x, y);
                                _this.set(x, y, tile);
                                break;
                        }
                    }
                Tile_1.Tile.instances.forEach(function (t) {
                    t.sprite = Tile_1.Tile.spriteFromType(t);
                });
                callback(out);
            };
            image.src = src;
        };
        return Map;
    }());
    exports.Map = Map;
});
define("index", ["require", "exports", "Input", "Tile", "Sprite", "Map"], function (require, exports, Input_1, Tile_2, Sprite_2, Map_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var cursor = new Sprite_2.Sprite(Sprite_2.spriteSheet, 7 * 8, 7 * 8, 8, 12);
    var horny = {
        sprite: new Sprite_2.Sprite(Sprite_2.spriteSheet, 8 * 8, 6 * 8, 8, 12),
        x: 32,
        y: 32
    };
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    Input_1.keyboard.init();
    Input_1.mouse.init();
    var camera = {
        x: 0,
        y: 0
    };
    var map = new Map_1.Map(64, 64);
    map.load("../data/maps/test.png", function (out) {
        camera.x = out.camX;
        camera.y = out.camY;
    });
    var selectState = false;
    requestAnimationFrame(function loop() {
        var speed = 0.125;
        var down = Input_1.keyboard.down;
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
        var cx = Math.round(-camera.x * 8);
        var cy = Math.round(-camera.y * 8);
        ctx.translate(cx + 32, cy + 32);
        for (var x = Math.max(0, ~~camera.x - 4); x < Math.min(63, ~~camera.x + 5); x++)
            for (var y = Math.max(0, ~~camera.y - 4); y < Math.min(63, ~~camera.y + 5); y++) {
                map.get(x, y).draw(ctx);
            }
        horny.sprite.draw(ctx, horny.x * 8, horny.y * 8);
        var mX = ~~(Input_1.mouse.x / 10 / 8 + camera.x - 4);
        var mY = ~~(Input_1.mouse.y / 10 / 8 + camera.y - 4);
        ctx.strokeRect(mX * 8 + 0.5, mY * 8 + 0.5, 7, 7);
        if (Input_1.mouse.pressed[1]) {
            var tile = Tile_2.Tile.findByPosition(mX, mY);
            if (tile && tile.interface.minable) {
                tile.selected = !tile.selected;
                selectState = tile.selected;
            }
        }
        if (Input_1.mouse.down[1]) {
            var tile = Tile_2.Tile.findByPosition(mX, mY);
            if (tile && tile.interface.minable) {
                tile.selected = selectState;
            }
        }
        ctx.restore();
        cursor.draw(ctx, Input_1.mouse.x / 10, Input_1.mouse.y / 10);
        Input_1.keyboard.update();
        Input_1.mouse.update();
        requestAnimationFrame(loop);
    });
});
//# sourceMappingURL=index.js.map