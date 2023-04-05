ig.baked = true;
ig.module('game.menus.pause').requires('game.menus.main').defines(function() {
    MenuItemSoundVolume = MenuItem.extend({
        getText: function() {
            return ' -  ' + (ig.soundManager.volume * 100).round() + '%  + ';
        },
        left: function() {
            ig.soundManager.volume = (ig.soundManager.volume - 0.1).limit(0, 1);
        },
        right: function() {
            ig.soundManager.volume = (ig.soundManager.volume + 0.1).limit(0, 1);
        },
        click: function() {
            if (ig.input.mouse.x > 240) {
                this.right();
            } else {
                this.left();
            }
        }
    });
    MenuItemMusicVolume = MenuItem.extend({
        getText: function() {
            return ' -  ' + (ig.music.volume * 100).round() + '%  + ';
        },
        left: function() {
            ig.music.volume = (ig.music.volume - 0.1).limit(0, 1);
        },
        right: function() {
            ig.music.volume = (ig.music.volume + 0.1).limit(0, 1);
        },
        click: function() {
            if (ig.input.mouse.x > 240) {
                this.right();
            } else {
                this.left();
            }
        }
    });
    MenuItemResume = MenuItem.extend({
        getText: function() {
            return 'return';
        },
        ok: function() {
            localStorage.setItem('soundVolume', ig.soundManager.volume);
            localStorage.setItem('musicVolume', ig.music.volume);
            ig.game.menu = null ;
        }
    });
    MenuPause = Menu.extend({
        scale: 0.8,
        clearColor: 'rgba(0,0,0,0.8)',
        init: function() {
            this.parent();
            this.y = ig.system.height / 3;
            this.items[0].y = 230 / this.scale;
            this.items[1].y = 360 / this.scale;
            this.items[2].y = 500 / this.scale;
            this.items[3].y = 560 / this.scale;
        },
        itemClasses: [MenuItemSoundVolume, MenuItemMusicVolume, MenuItemResume, MenuItemBack],
        draw: function() {
            this.width = ig.system.width / this.scale;
            var ctx = ig.system.context;
            this.parent();
            var s = 0.85;
            ctx.save();
            ctx.scale(s, s);
            ctx.globalAlpha = 0.5;
            this.font.draw('GAME PAUSED', ig.system.width / 2 / s, 60 / s, ig.Font.ALIGN.CENTER);
            ctx.restore();
            ctx.save();
            s = 0.5;
            ctx.scale(s, s);
            ctx.globalAlpha = 0.5;
            this.font.draw('SOUND', ig.system.width / 2 / s, 200 / s, ig.Font.ALIGN.CENTER);
            this.font.draw('MUSIC', ig.system.width / 2 / s, 330 / s, ig.Font.ALIGN.CENTER);
            ctx.restore();
        }
    });
});
