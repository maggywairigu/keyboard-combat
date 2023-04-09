ig.baked = true;
ig.module('game.keyboard').requires('impact.font').defines(function() {
    ig.Keyboard = ig.Class.extend({
        background: new ig.Image('media/ui/keyboard.png'),
        empButton: new ig.Image('media/ui/emp-buttons.png'),
        pauseButton: new ig.Image('media/ui/pause.png'),
        font: new ig.Font('media/fonts/avenir-36-blue.png'),
        hoverImages: {
            leftEdge: new ig.Image('media/ui/key-edge-left.png'),
            rightEdge: new ig.Image('media/ui/key-edge-right.png'),
            normal: new ig.Image('media/ui/key.png')
        },
        multiBar: new ig.Image('media/ui/bar-blue.png'),
        multiIndicator: new ig.Image('media/ui/multi-indicator.png'),
        multiSounds: {
            2: new ig.Sound('media/sounds/multi-2.ogg'),
            3: new ig.Sound('media/sounds/multi-3.ogg')
        },
        width: 0,
        height: 0,
        hoverKey: null ,
        expectedKeys: null ,
        keys: [['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'], ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'], ['z', 'x', 'c', 'v', 'b', 'n', 'm']],
        layout: {
            key: {
                width: 64,
                height: 106
            }
        },
        init: function(callback) {
            ig.system.canvas.addEventListener('touchmove', this.touchmove.bind(this), false);
            ig.system.canvas.addEventListener('touchend', this.touchend.bind(this), false);
            ig.system.canvas.addEventListener('touchstart', this.touchstart.bind(this), false);
            this.callback = callback;
            this.width = this.background.width;
            this.height = (ig.ua.mobile ? this.background.height : 64);
            this.drawScale = ig.system.width / this.width;
            this.x = 0;
            this.y = ig.system.height / this.drawScale - this.height;
        },
        getCurrentKey: function(touches) {
            var touch = touches[touches.length - 1];
            var documentScale = (parseInt(ig.system.canvas.offsetWidth) || ig.system.realWidth) / ig.system.width;
            var touchX = (touch.clientX / documentScale) / this.drawScale
              , touchY = (touch.clientY / documentScale) / this.drawScale;
            if (touchX < 96 && touchY < 96) {
                return 'ESC';
            } 
            else if (touchY < this.y - 20) {
                return 'BACKSPACE';
            } 
            else if (touchY > this.y + 214 && touchX > this.x + 560) {
                return 'ENTER';
            }
            var row = ((touchY - this.y) / this.layout.key.height) | 0;
            if (row < 0 || !this.keys[row]) {
                return;
            }
            var offsetX = (this.background.width - this.keys[row].length * this.layout.key.width) / 2;
            var col = ((touchX - this.x - offsetX) / this.layout.key.width) | 0;
            var key = this.keys[row][col];
            if (this.expectedKeys) {
                var closest = Infinity;
                for (var i = 0; i < this.expectedKeys.length; i++) {
                    var kpos = ig.Keyboard.Map[this.expectedKeys[i]];
                    var keyX = kpos[0] * this.layout.key.width + this.layout.key.width / 2
                      , keyY = kpos[1] * this.layout.key.height + this.layout.key.height / 2;
                    var dx = touchX - this.x - keyX
                      , dy = touchY - this.y - keyY;
                    var distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < this.layout.key.width && distance < closest) {
                        closest = distance;
                        key = this.expectedKeys[i];
                    }
                }
            }
            return key;
        },
        touchstart: function(ev) {
            var key = this.getCurrentKey(ev.touches);
            if (key !== 'ESC' && key !== 'ENTER' && key !== 'BACKSPACE') {
                this.hoverKey = key;
            }
        },
        touchmove: function(ev) {
            var key = this.getCurrentKey(ev.touches);
            if (key !== 'ESC' && key !== 'ENTER' && key !== 'BACKSPACE') {
                this.hoverKey = key;
            }
        },
        touchend: function(ev) {
            var key = this.getCurrentKey(ev.changedTouches);
            if (key) {
                this.callback(key);
            }
            this.hoverKey = null ;
        },
        showMultiplier: function(m) {
            this.multiplierTimer = new ig.Timer(2);
            this.multiplierIndex = m - 2;
            this.multiSounds[m].play();
        },
        drawFull: function() {
            var ctx = ig.system.context;
            ctx.save();
            ctx.globalAlpha = 1;
            ctx.scale(this.drawScale, this.drawScale);
            this.background.draw(this.x, this.y);
            this.drawMultiplierBar(this.x, this.y);
            if (this.hoverKey) {
                var offsetX = 0;
                var hoverImage = this.hoverImages.normal;
                if (this.hoverKey == 'q') {
                    hoverImage = this.hoverImages.leftEdge;
                    offsetX = 26;
                } 
                else if (this.hoverKey == 'p') {
                    hoverImage = this.hoverImages.rightEdge;
                    offsetX = -26;
                }
                var kpos = ig.Keyboard.Map[this.hoverKey];
                var x = (kpos[0] * this.layout.key.width - 19 + offsetX)
                  , y = this.y + kpos[1] * this.layout.key.height - 112;
                ctx.globalAlpha = 0.9;
                hoverImage.draw(x, y);
                ig.system.context.globalAlpha = 1;
                this.font.draw(this.hoverKey.toUpperCase(), x + 51, y + 24, ig.Font.ALIGN.CENTER);
            }
            if (!ig.game.emps) {
                ctx.globalAlpha = 0.7;
            }
            this.empButton.drawTile(this.x + 582, this.y + 250, ig.game.emps, 34, 40);
            ctx.globalAlpha = 0.15;
            this.pauseButton.draw(28, 28);
            ctx.restore();
        },
        drawMultiplierBar: function(x, y) {
            if (ig.game.streak > 0) {
                var multiLength = 1 - (75 / (75 + ig.game.streak * 2));
                this.multiBar.draw(x, y, 0, 0, this.width * multiLength, 2);
            }
            var showMultiplierTime = this.multiplierTimer ? this.multiplierTimer.delta() : 0;
            if (showMultiplierTime < 0) {
                ig.system.context.globalAlpha = showMultiplierTime.map(-2, 0, 2, 0).limit(0, 1);
                this.multiIndicator.drawTile(x + this.width * multiLength - 30, y - 22, this.multiplierIndex, 32, 18);
                ig.system.context.globalAlpha = 1;
            }
        },
        drawMinimal: function() {
            var ctx = ig.system.context;
            ctx.save();
            ctx.globalAlpha = 1;
            ctx.scale(this.drawScale, this.drawScale);
            this.drawMultiplierBar(this.x, this.y + 62);
            if (!ig.game.emps) {
                ctx.globalAlpha = 0.7;
            }
            this.empButton.drawTile(this.x + 582, this.y, ig.game.emps, 34, 40);
            ctx.globalAlpha = 0.1;
            this.pauseButton.draw(28, 28);
            ctx.restore();
        },
        draw: function() {
            if (ig.ua.mobile) {
                this.drawFull();
            } 
            else {
                this.drawMinimal();
            }
        }
    });
    ig.Keyboard.Map = {
        q: [0, 0],
        w: [1, 0],
        e: [2, 0],
        r: [3, 0],
        t: [4, 0],
        y: [5, 0],
        u: [6, 0],
        i: [7, 0],
        o: [8, 0],
        p: [9, 0],
        a: [0.5, 1],
        s: [1.5, 1],
        d: [2.5, 1],
        f: [3.5, 1],
        g: [4.5, 1],
        h: [5.5, 1],
        j: [6.5, 1],
        k: [7.5, 1],
        l: [8.5, 1],
        z: [1.5, 2],
        x: [2.5, 2],
        c: [3.5, 2],
        v: [4.5, 2],
        b: [5.5, 2],
        n: [6.5, 2],
        m: [7.5, 2]
    };
});
