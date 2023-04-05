ig.baked = true;
ig.module('game.menus.gameover').requires('game.menus.main', 'game.menus.stats').defines(function() {
    
    MenuGameOver = Menu.extend({
        itemClasses: [MenuItemBack],
        scale: 0.75,
        personalBestBadge: new ig.Image('media/ui/personal-best-badge.png'),
        fontTitle: new ig.Font('media/fonts/largegreen.png'),
        separatorBar: new ig.Image('media/fonts/greenbar.png'),
        init: function() {
            var lastBannerTime = parseInt(localStorage.getItem('bannerTime')) || 0;
            if (lastBannerTime < Date.now() / 1000 - 24 * 60 * 60) {
                localStorage.setItem('bannerTime', (Date.now() / 1000) | 0);
                this.itemClasses[0] = MenuItemInterstitial;
            }
            this.parent();
            this.y = (ig.system.height - 130) / this.scale;
            this.width = ig.system.width / this.scale;
            this.stats = new StatsView(432,ig.system.height - 500);
            this.stats.submit({
                score: ig.game.score,
                mission: ig.game.mission.mission,
                kombat: ig.game.longestCombat,
                accuracy: ig.game.hits ? ig.game.hits / (ig.game.hits + ig.game.misses) * 100 : 0
            });
            this.timer = new ig.Timer();
        },
        update: function() {
            if (this.timer.delta() > 1.5) {
                this.parent();
            }
        },
        draw: function() {
            this.parent();
            var xs = ig.system.width / 2;
            var ys = 25;
            var acc = ig.game.hits ? ig.game.hits / (ig.game.hits + ig.game.misses) * 100 : 0;
            var ctx = ig.system.context;
            if (ig.game.isPersonalBest) {
                ctx.save();
                ctx.scale(0.5, 0.5);
                this.personalBestBadge.draw(24 / 0.5, 275 / 0.5);
                this.font.draw('HIGH SCORE', 60 / 0.5, 280 / 0.5, ig.Font.ALIGN.LEFT);
                ctx.restore();
            }
            var ss = 0.5;
            ctx.save();
            ctx.scale(ss, ss);
            ctx.globalAlpha = 0.5;
            this.font.draw('FINAL SCORE', 24 / ss, (ys + 0) / ss);
            this.font.draw('MISSIONS', 252 / ss, (ys + 0) / ss);
            this.font.draw('ACCURACY', 24 / ss, (ys + 140) / ss);
            this.font.draw('LONGEST COMBAT', 252 / ss, (ys + 140) / ss);
            ctx.restore();
            this.fontTitle.draw(ig.game.score.zeroFill(6), 24, ys + 25);
            this.fontTitle.draw('MISSON ' + ig.game.mission.mission.zeroFill(3), 252, ys + 25);
            ig.system.context.drawImage(this.separatorBar.data, 24, ys + 70, 432, 2);
            this.fontTitle.draw(acc.round(1) + '%', 24, ys + 165);
            this.fontTitle.draw(ig.game.longestCombat, 252, ys + 165);
            ig.system.context.drawImage(this.separatorBar.data, 24, ys + 210, 432, 2);
            if (this.stats) {
                this.stats.draw(24, ys + 300);
            }
        }
    });
});