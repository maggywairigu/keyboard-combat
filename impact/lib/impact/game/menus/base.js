ig.baked = true;
ig.module('game.menus.base').requires('impact.font').defines(
    function() {
        MenuItem = ig.Class.extend({
            getText: function() {
                return 'none'
            },
            left: function() {},
            right: function() {},
            ok: function() {},
            click: function() {
                this.ok();
                ig.system.canvas.style.cursor = 'auto';
            }
        });

        MenuItemBack = MenuItem.extend({
            getText: function() {
                return 'Back to title';
            },
            ok: function() {
                ig.game.setTitle();
            }
        });

        Menu = ig.Class.extend({
            clearColor: null,
            name: null,
            font: new ig.Font('media/fonts/largewhite.png'),
            fontSelected: new ig.Font('media/fonts/tanlarge.png'),
            current: 0,
            itemClasses: [],
            items: [],
            scale: 1,
            alpha: 1,
            init: function() {
                this.width = ig.system.width;
                this.y = ig.system.height / 4+160;
                this.font.letterSpacing = -2;
                this.fontSelected.letterSpacing = -2;
                for (var i = 0; i < this.itemClasses.length; i++){
                    this.items.push(new this.itemClasses[i]());
                }
            },
            update: function() {
                if (ig.input.pressed('up')){
                    this.current--;
                }
                if (ig.input.pressed('down')){
                    this.current++;
                }
                this.current = this.current.limit(0, this.items.length - 1);
                if (ig.input.pressed('left')){
                    this.items[this.current].left();
                }
                if (ig.input.pressed('right')){
                    this.items[this.current].right();
                }
                if (ig.input.pressed('okay')){
                    this.items[this.current].ok();
                }
                var ys = this.y;
                var xs = ig.system.width / 2;
                var hoverItem = null;
                for (var i = 0; i < item.length; i++){
                    
                }
            }
        })
});