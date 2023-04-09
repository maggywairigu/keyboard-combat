ig.baked = true;
ig.module('game.index').requires('impact.game', 'impact.font', 'game.menus.game-over', 'game.menus.pause', 'game.menus.title', 'game.entities.enemy-missle', 'game.entities.enemy-mine', 'game.entities.enemy-destroyer', 'game.entities.enemy-oppressor', 'game.entities.player', 'game.keyboard', 'game.xml', 'game.ease', 'plugins.silent-loader', 'plugins.rise-loader', 'game.document-scanner', 'game.words.en').defines(function() {
    Number.zeroes = '000000000000';
    //creates a function that fills d numbers of zeros before a number 
    Number.prototype.zeroFill = function(d) 
    {
        var s = this.toString();
        return Number.zeroes.substr(0, d - s.length) + s;
    };
    //creates a new class Kombat that extends ig.Game which creates and entry point for running the game in the browser
    Kombat = ig.Game.extend
    ({
        //instances of ig.font for rendering text
        font: new ig.Font('media/fonts/whitesmall.png'),
        fontTitle: new ig.Font('media/fonts/greenlarge.png'),
        //instance of ig.image for rendering images
        separatorBar: new ig.Image('media/ui/greenbar.png'),
        idleTimer: null ,
        spawnTimer: null ,
        //holds the targets for the game
        targets: {},
        currentTarget: null ,
        //for use in scrolling the games background
        yScroll: 0,
        yScroll2: 0,
        range: new ig.Image('media/background/range.jpg'),
        stars: new ig.Image('media/background/stars.jpg'),
        grid: new ig.Image('media/background/grid.png'),
        music: new ig.Sound('media/music/ambience.ogg',false),
        cancelSound: new ig.Sound('media/sounds/buzz.ogg'),
        spawnSound: new ig.Sound('media/sounds/intro.ogg'),
        menu: null ,
        mode: 0,
        score: 0,
        streak: 0,
        hits: 0,
        misses: 0,
        multiplier: 1,
        mission: {},
        gameTime: 0,
        kills: 0,
        emps: 0,
        personalBest: 0,
        isPersonalBest: false,
        //waitingForItunes: false,
        //adPage: null ,
        difficulty: (ig.ua.mobile ? 'MOBILE' : 'DESKTOP'),
        keyboard: null ,
        //shaking the screen during game play
        _screenShake: 0,
        //string and accessing list of words for the game
        wordlist: null ,
        init: function() 
        {
            //Checks if the document has more than 2 pages
            if (ig.doc && ig.doc.fragments.length < 2) {
                ig.doc = null ;
            }
            this.fontTitle.letterSpacing = -2;
            this.font.letterSpacing = -1;
            //creates a repeating background map of this.grid
            var bgmap = new ig.BackgroundMap(620,[[1]],this.grid);
            bgmap.repeat = true;
            this.backgroundMaps.push(bgmap);
            //adds this.music to ig.music and randomly loops it
            ig.music.add(this.music);
            ig.music.loop = true;
            ig.music.random = true;
            //retrieves the sound and music volume from the local storage and sets ig.soundManager and ig.music volume accordingly
            var soundVolume = localStorage.getItem('soundVolume');
            var musicVolume = localStorage.getItem('musicVolume');
            if (soundVolume !== null  && musicVolume !== null ) 
            {
                ig.soundManager.volume = parseFloat(soundVolume);
                ig.music.volume = parseFloat(musicVolume);
            }
            //event listeners for key press and key down events 
            window.addEventListener('keypress', this.keypress.bind(this), false);
            window.addEventListener('keydown', this.keydown.bind(this), false);
            //creates ig.keyboard instance and binds the input keys
            this.keyboard = new ig.Keyboard(this.virtualKeydown.bind(this));
            ig.input.bind(ig.KEY.ENTER, 'ok');
            ig.input.bind(ig.KEY.SPACE, 'ok');
            ig.input.bind(ig.KEY.MOUSE1, 'click');
            ig.input.bind(ig.KEY.ESC, 'menu');
            ig.input.bind(ig.KEY.UP_ARROW, 'up');
            ig.input.bind(ig.KEY.DOWN_ARROW, 'down');
            ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
            ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
            //sets the canvas onclick event to focus on window
            ig.system.canvas.onclick = function() 
            {
                window.focus();
            };
            //retrieves the highest score and sets it to this.personalBest
            this.personalBest = parseInt(localStorage.getItem('highscore')) | 0;
            //creates a Ejecta.Gamesector instance if the game is running in Ejecta and authenticates the user 
            if (window.Ejecta) 
            {
                this.gameCenter = new Ejecta.GameCenter();
                this.gameCenter.authenticate();
                /*if (!localStorage.getItem('removeAds')) {
                    this.adPage = new Ejecta.AdMobPage("ca-app-pub-8533552145182353/1344920700");
                }*/
            }
            /*if (window.Cocoon && window.Cocoon.Ad) {
                Cocoon.Ad.configure({
                    android: {
                        interstitial: 'ca-app-pub-8533552145182353/1042008307'
                    }
                });
                this.cocoonInterstitial = Cocoon.Ad.createInterstitial();
            }*/
            //sets the game title
            this.setTitle();
            //sets the wordlist property to ig.WORDS.EN object which contains an array of words and generates them randomly
            this.wordlist = ig.WORDS.EN;
            //if ig.doc exists calls the fastforwardscananimation() method and checks whether a character matches with the character in the word
            if (ig.doc) 
            {
                this.reAllWordCharacter = /^[a-zßàáâãäåæçèéêëìíîïðñòóôõöøùúûüý]+$/i;
                this.reSplitNonWord = /[^0-9a-zßàáâãäåæçèéêëìíîïðñòóôõöøùúûüý]/i;
                ig.doc.fastForwardScanAnimation();
            }
        },
        //resets the game state to its initial values
        reset: function() 
        {
            //clears out the list of game entities 
            this.entities = [];
            this.currentTarget = null ;
            //sets mission difficulty to a copy of the initial mission state from the constant array Kombat.MISSIONS
            this.mission = ig.copy(Kombat.MISSIONS[this.difficulty]);
            //create an empty dictionary object target that will hold the letters of the alphabet and their corresponding characters
            var first = 'a'.charCodeAt(0)
              , last = 'z'.charCodeAt(0);
            for (var i = first; i <= last; i++) {
                this.targets[String.fromCharCode(i)] = [];
            }
            //creates an empty array for each character in the this._umlautTable object, keep track of characters missed by the player
            for (var c in this._umlautTable) {
                this.targets[c] = [];
            }
            //sets these game variables to their initial state
            this.score = 0;
            this.rs = 0;
            this.streak = 0;
            this.longestStreak = 0;
            this.hits = 0;
            this.misses = 0;
            this.kills = 0;
            this.multiplier = 1;
            this.gameTime = 0;
            this.isPersonalBest = false;
            this.speedFactor = 1;
            this.lastKillTimer = new ig.Timer();
            this.spawnTimer = new ig.Timer();
            this.idleTimer = new ig.Timer();
            //no active mission where the game is reset
            this.missionEndTimer = null ;
        },
        //updates the game difficulty and parameters for the next mission 
        nextMission: function() 
        {
            //increments the mission property by 1
            this.mission.mission++;
            //adjusts spawnWait and currentSpawnWait properties based on the current difficulty level
            this.mission.spawnWait = (this.mission.spawnWait * 0.97).limit(0.2, 1);
            this.mission.currentSpawnWait = this.mission.spawnWait;
            this.mission.spawn = [];
            //increases the speed of the game 
            this.speedFactor *= this.mission.speedIncrease;
            //checks if ig.doc is defined and generates a new doc fragment for the game and reverses the misses.spawn array
            //else updates the mission.spawn array with new types of targets based on the games parameters
            //adjusts the count property for each type of target based on mission level, randomizes the order of misses.spawn array 
            if (ig.doc) 
            {
                for (var i = 0; i < 10 && this.mission.spawn.length < 2; i++) 
                {
                    this.nextDocFragment();
                }
                this.misses.spawn.reverse();
            } 
            else 
            {
                var dec = 0;
                for (var t = 0; t < this.mission.types.length; t++) 
                {
                    var type = this.mission.types[t];
                    type.count -= dec;
                    if (this.mission.mission % type.incEvery == 0) 
                    {
                        type.count++;
                        dec++;
                    }
                    for (var s = 0; s < type.count; s++) 
                    {
                        this.mission.spawn.push(type);
                    }
                }
                this.mission.spawn.sort(function() 
                {
                    return Math.random() - 0.5;
                });
            }
        },
        //generate a new set of enemy objects to spawn in the game
        nextDocFragment: function() {
            //generates game next mission
            this.mission.fragment++;
            var fragment = ig.doc.fragments[(this.mission.fragment - 1) % ig.doc.fragments.length];//retrieve next game fragment
            if (!ig.ua.mobile) {
                ig.doc.highlightFragment(fragment);
            }
            //increase the number of enemies
            for (var t = 0; t < this.mission.types.length; t++) {
                var type = this.mission.types[t];
                if (this.mission.mission % type.incEvery == 0) {
                    type.count++;
                }
            }
            //remove unwanted characters from words
            var words = fragment.text.replace(/['’‘’’]/g, '').split(this.reSplitNonWord);
            var filteredWords = [];
            for (var i = 0; i < words.length; i++) {
                var w = words[i].trim();
                if (w.match(this.reAllWordCharacter)) {
                    filteredWords.push(w);
                }
            }
            var wordsByLength = filteredWords.slice().sort(function(a, b) {
                return b.length - a.length;
            });
            var bigShipChance = (this.mission.types[0].count + this.mission.types[1].count) / this.mission.types[2].count;
            var wordLengthForBigShip = wordsByLength[Math.floor(wordsByLength.length * bigShipChance * 0.75)].length;
            var longSentenceFactor = (filteredWords.length / 8).limit(1, 1.5);
            for (var i = 0; i < filteredWords.length; i++) {
                var w = filteredWords[i];
                var wait = (w.length / 5).limit(0.7, 3) * 1.2 * longSentenceFactor;
                var type = (w.length > wordLengthForBigShip) ? (Math.random() > 0.75 ? EntityEnemyOppressor : EntityEnemyDestroyer) : EntityEnemyMine;
                this.mission.spawn.push({
                    type: type,
                    word: w,
                    wait: wait
                });
            }
        },
        //spawn enemies for the current mission 
        spawnCurrentMission: function() {
            //are there any more enemies to spawn 
            if (!this.mission.spawn.length) {
                if (this.entities.length <= 1 && !this.missionEndTimer) { //if only the player is left start next mission after 2 seconds
                    this.missionEndTimer = new ig.Timer(2);
                } 
                else if (this.missionEndTimer && this.missionEndTimer.delta() > 0) {
                    this.missionEndTimer = null ;
                    this.nextMission();
                }
            } 
            else if (this.spawnTimer.delta() > this.mission.currentSpawnWait) {//generate a new enemy
                this.spawnTimer.reset();
                var spawn = this.mission.spawn.pop();
                var x = Math.random().map(0, 1, 10, ig.system.width - 10);
                var y = -30;
                this.spawnEntity(spawn.type, x, y, {
                    healthBoost: this.mission.healthBoost,
                    word: spawn.word
                }, true);
                //set waiting time for spawning the next enemy
                this.mission.currentSpawnWait = spawn.wait ? this.mission.spawnWait * spawn.wait : this.mission.spawnWait;
            }
        },
        //create new entity of a given type and adds it to the game world
        spawnEntity: function(type, x, y, settings, atBeginning) {
            var ent = new (type)(x,y,settings || {});
            if (atBeginning) {//if atBeginning property is true it is added to the beginning of the entity list
                this.entities.unshift(ent);
            } 
            else {
                this.entities.push(ent);
            }
            if (ent.name) {
                this.namedEntities[ent.name] = ent; //if it has a name it added to the named entity list
            }
            return ent;
        },
        //register targets to specified characters 
        registerTarget: function(letter, ent) {
            var c = this.translateUmlaut(letter.toLowerCase());
            this.targets[c].push(ent);
            if (!this.currentTarget) {
                this.setExpectedKeys();
            }
        },
        //remove an entity from a list of potential targets associated with a particular letter 
        unregisterTarget: function(letter, ent) {
            var c = this.translateUmlaut(letter.toLowerCase());
            this.targets[c].erase(ent);
            if (!this.currentTarget) {
                this.setExpectedKeys();
            }
        },
        //sets the expected keys to be pressed by the player inorder to destroy the enemies
        setExpectedKeys: function() {
            this.keyboard.expectedKeys = [];
            for (var k in this.targets) {
                if (this.targets[k].length) {
                    this.keyboard.expectedKeys.push(k);
                }
            }
        },
        _umlautTable: {
            'ß': 's',
            'à': 'a',
            'á': 'a',
            'â': 'a',
            'ã': 'a',
            'ä': 'a',
            'å': 'a',
            'æ': 'a',
            'ç': 'c',
            'è': 'e',
            'é': 'e',
            'ê': 'e',
            'ë': 'e',
            'ì': 'i',
            'í': 'i',
            'î': 'i',
            'ï': 'i',
            'ð': 'd',
            'ñ': 'n',
            'ò': 'o',
            'ó': 'o',
            'ô': 'o',
            'õ': 'o',
            'ö': 'o',
            'ø': 'o',
            'ù': 'u',
            'ú': 'u',
            'û': 'u',
            'ü': 'u',
            'ý': 'y'
        },
        //check if device is a phone or if ig.doc is in english
        translateUmlaut: function(k) {
            if (ig.ua.mobile || (ig.doc && ig.doc.looksLikeEnglish)) {
                return this._umlautTable[k] || k; //translate
            } 
            else {
                return k;//print the original
            }
        },
        //what happens when the keypress event occurs 
        keypress: function(ev) {
            //if the key pressed was not a letter return true 
            if (ev.target.tagName == 'INPUT' || ev.ctrlKey || ev.altKey || this.mode != Kombat.MODE.GAME || this.menu) {
                return true;
            }
            //if its a letter call the shoot() function with the letter pressed converted to lowercase
            var c = ev.charCode;
            if (c < 64) {
                return true;
            }
            ev.stopPropagation();
            ev.preventDefault();
            var letter = String.fromCharCode(c).toLowerCase();
            this.shoot(letter);
            return false;
        },
        //handles keydown events 
        keydown: function(ev) {
            if (ev.target.tagName == 'INPUT' || ev.ctrlKey || ev.altKey || this.mode != Kombat.MODE.GAME || this.menu) {
                return true;
            }
            var c = ev.which;
            if (c === ig.KEY.ENTER) {
                this.player.spawnEMP();
                return false;
            }
            if (c == ig.KEY.BACKSPACE) {
                if (this.currentTarget) {
                    this.currentTarget.cancel();
                    this.cancelSound.play();
                }
                ev.preventDefault();
                return false;
            }
            return true;
        },
        //simulates a key press event in response to user input via touch or mouse
        virtualKeydown: function(letter) {
            if (this.mode != Kombat.MODE.GAME || this.menu) {
                return true;
            }
            if (letter == 'ENTER') {
                this.player.spawnEMP();
                return true;
            }
            if (letter == 'ESC') {
                this.menu = new MenuPause();
                return true;
            }
            if (letter == 'BACKSPACE') {
                if (this.currentTarget) {
                    this.currentTarget.cancel();
                    this.cancelSound.play();
                }
                return true;
            }
            this.shoot(letter);
        },
        //handle player input and check if the input matches with the target 
        shoot: function(letter) {
            //idleTimer is reset inorder to indicate that the game is active 
            this.idleTimer.reset();
            if (!this.currentTarget) {
                var potentialTargets = this.targets[letter];
                var nearestDistance = -1;
                var nearestTarget = null ;
                for (var i = 0; i < potentialTargets.length; i++) {
                    var distance = this.player.distanceTo(potentialTargets[i]);
                    if (distance < nearestDistance || !nearestTarget) {
                        nearestDistance = distance;
                        nearestTarget = potentialTargets[i];
                    }
                }
                if (nearestTarget) {
                    nearestTarget.target();
                } 
                else {
                    this.player.miss();
                    this.multiplier = 1;
                    this.streak = 0;
                    this.misses++;
                }
            }
            if (this.currentTarget) {
                var target = this.currentTarget;
                var hit = this.currentTarget.isHitBy(letter);
                if (hit) {
                    this.player.shoot(target);
                    this.score += this.multiplier;
                    this.hits++;
                    this.streak++;
                    this.longestStreak = Math.max(this.streak, this.longestStreak);
                    if (Kombat.MULTIPLIER_TIERS[this.streak]) {
                        this.multiplier = Kombat.MULTIPLIER_TIERS[this.streak];
                        this.keyboard.showMultiplier(this.multiplier);
                    }
                    if (target.dead) {
                        this.kills++;
                        this.setExpectedKeys();
                    } 
                    else {
                        var translated = this.translateUmlaut(target.remainingWord.charAt(0).toLowerCase());
                        if (this.keyboard) {
                            this.keyboard.expectedKeys = [translated];
                        }
                    }
                } 
                else {
                    this.player.miss();
                    this.multiplier = 1;
                    this.streak = 0;
                    this.misses++;
                }
            }
        },
        //set up the new game or next mission
        setGame: function() {
            this.reset();
            this.gameTransitionTimer = new ig.Timer(2);
            var sx = ig.system.width / 2 - 6
              , sy = ig.system.height - this.keyboard.height * this.keyboard.drawScale - 30;
            this.player = this.spawnEntity(EntityPlayer, sx, sy);
            this.mode = Kombat.MODE.GAME;
            this.nextmission();
            ig.music.next();
            this.spawnSound.play();
            this.emps = 3;
        },
        //sets the game over page ie updating scores, fading the score out
        setGameOver: function() {
            if (this.score > this.personalBest) {
                this.isPersonalBest = true;
                this.personalBest = this.score;
                localStorage.setItem('highscore', this.personalBest);
            }
            if (this.gameCenter && this.score > 5) {
                this.gameCenter.reportScore('score', this.score);
            }
            this.mode = Kombat.MODE.GAME_OVER;
            ig.music.fadeOut(1);
        },
        showGameOverScreen: function() {
            this.menu = new MenuGameOver();
            
        },
        setTitle: function() {

            this.reset();
            this.mode = Kombat.MODE.TITLE;
            this.menu = new MenuTitle();
            this.emps = 0;
        },
        update: function() {
            if (ig.input.pressed('menu')) {
                if (this.menu && this.menu instanceof MenuPause) {
                    this.menu = null ;
                } 
                else if (!this.menu) {
                    this.menu = new MenuPause();
                }
            }
            if (this.menu) {
                this.backgroundMaps[0].scroll.y -= 100 * ig.system.tick;
                if (this.waitingForItunes) {
                    return;
                }
                this.menu.update();
                if (!(this.menu instanceof MenuGameOver)) {
                    return;
                }
            }
            this.parent();
            if (this.mode === Kombat.MODE.GAME) {
                this.spawnCurrentKombat();
                if (!this.menu && !ig.ua.mobile && ig.input.pressed('click') && ig.input.mouse.x < 64 && ig.input.mouse.y < 64) {
                    this.menu = new MenuPause();
                }
            } 
            else if (ig.input.pressed('ok')) {
                if (this.mode === Kombat.MODE.TITLE) {
                    this.setGame();
                } 
                else if ((this.mode === Kombat.MODE.GAME_OVER && this.menu && this.menu.timer.delta() > 1.5) || this.mode !== Kombat.MODE.GAME_OVER) {
                    this.setTitle();
                }
            }
            var scrollSpeed = 100;
            if (this.missionEndTimer) {
                this.player.targetAngle = 0;
                var dt = Math.sin((this.missionEndTimer.delta() * -0.5) * Math.PI);
                scrollSpeed = 100 + dt * dt * 300;
                this.idleTimer.reset();
            }
            this.yScroll2 += ig.system.tick * scrollSpeed * 0.1;
            this.yScroll2 = this.yScroll2 % this.stars.height;
            this.yScroll -= scrollSpeed * ig.system.tick;
            this.backgroundMaps[0].scroll.y = this.yScroll;
            if (this.entities.length > 1 && this.mode == Kombat.MODE.GAME) {
                this.gameTime += ig.system.tick;
            }
            if (this.score - this.rs > 100 || ig.Timer.timeScale != 1) {
                this.score = 0;
            }
            this.rs = this.score;
            this._screenShake /= 1.1;
            if (this._screenShake < 0.5) {
                this._screenShake = 0;
            }
            this._rscreen.x = Math.random() * this._screenShake;
            this._rscreen.y = Math.random() * this._screenShake;
        },
        screenShake: function(strength) {
            this._screenShake = Math.max(strength, this._screenShake);
        },
        draw: function() {
            if (this.mode == Kombat.MODE.GAME || this.mode === Kombat.MODE.GAME_OVER) {
                this.drawGame();
            }
            if (this.menu) {
                this.menu.draw();
                if (typeof (this.menu.scroll) != 'undefined') {
                    this.yScroll2 = this.menu.scroll;
                }
                if (this.gameTransitionTimer) {
                    var dt = 2 - (this.gameTransitionTimer.delta() * -1);
                    this.menu.transition = (dt / 2);
                    var sy = ig.system.height - this.keyboard.height * this.keyboard.drawScale - 30;
                    var move = sy - MenuTitle.prototype.playerPos.y;
                    this.menu.playerPos.y = ig.ease.inOutBack(dt, MenuTitle.prototype.playerPos.y, move, 2);
                    this.menu.alpha = 1 - (dt / 2);
                    this.player.pos.y = this.menu.playerPos.y;
                    if (dt > 2) {
                        this.gameTransitionTimer = null ;
                        this.menu = null ;
                    }
                }
            }
            /*if (this.waitingForItunes) {
                this.drawSpinner();
            }*/
        },
        /*drawSpinner: function() {
            ig.system.context.fillStyle = 'rgba(0,0,0,0.7)';
            ig.system.context.fillRect(0, 0, ig.system.width, ig.system.height);
            var spinner = ['', '.', '..', '...'];
            var tt = ((ig.Timer.time * 5) % spinner.length) | 0;
            this.fontTitle.draw(spinner[tt], ig.system.width / 2 - 16, ig.system.height / 2);
        },*/
        drawGame: function() {
            var ctx = ig.system.context;
            ctx.save();
            ctx.scale(0.75, 0.75);
            this.stars.draw(0, this.yScroll2 - this.stars.height);
            this.stars.draw(0, this.yScroll2);
            ctx.restore();
            ig.system.context.globalAlpha = 0.8;
            ig.system.context.drawImage(this.range.data, 0, 0, ig.system.width, ig.system.height);
            var d = this.lastKillTimer.delta();
            ig.system.context.globalAlpha = d < 0 ? d * -1 + 0.1 : 0.1;
            this.backgroundMaps[0].draw();
            ig.system.context.globalAlpha = 1;
            ig.system.context.globalCompositeOperation = 'lighter';
            for (var i = 0; i < this.entities.length; i++) {
                this.entities[i].draw();
            }
            ig.system.context.globalCompositeOperation = 'source-over';
            for (var i = 0; i < this.entities.length; i++) {
                this.entities[i].drawLabel && this.entities[i].drawLabel();
            }
            if (this.mode == Kombat.MODE.GAME) {
                this.drawUI();
            }
        },
        drawUI: function() {
            if (this.missionEndTimer) {
                var d = -this.missionEndTimer.delta();
                var a = d > 1.7 ? d.map(2, 1.7, 0, 1) : d < 1 ? d.map(1, 0, 1, 0) : 1;
                var ys = 276 + (d < 1 ? Math.cos(1 - d).map(1, 0, 0, 250) : 0);
                var w = this.mission.mission.zeroFill(3);
                ig.system.context.globalAlpha = a;
                this.fontTitle.draw('MISSION ' + w + ' DONE', 32, ys, ig.Font.ALIGN.LEFT);
                ig.system.context.drawImage(this.separatorBar.data, 32, ys + 48, 276, 2);
                this.font.draw('SCORE: ' + this.score.zeroFill(6), 32, (ys * 1.2) + 10, ig.Font.ALIGN.LEFT);
                ig.system.context.globalAlpha = 1;
            }
            /*if (!ig.ua.mobile && this.idleTimer.delta() > 8) {
                var aa = this.idleTimer.delta().map(8, 9, 0, 1).limit(0, 1);
                ig.system.context.globalAlpha = (Math.sin(this.idleTimer.delta() * 4) * 0.25 + 0.75) * aa;
                this.font.draw('Type the words to shoot!\nENTER for EMP', ig.system.width / 2, ig.system.height - 180, ig.Font.ALIGN.CENTER);
                ig.system.context.globalAlpha = 1;
            }*/
            this.keyboard.draw();
        },
        /*purchaseRemoveAds: function() {
            this.iap = this.iap || new Ejecta.IAPManager();
            ig.game.waitingForItunes = true;
            this.iap.getProducts(['removeAds'], function(error, products) {
                if (error) {
                    ig.game.waitingForItunes = false;
                    ig.game.setTitle();
                } 
                else if (products.length) {
                    products[0].purchase(1, function(error, transaction) {
                        ig.game.waitingForItunes = false;
                        if (error) {
                            console.log(error);
                        } 
                        else {
                            localStorage.setItem('removeAds', true);
                        }
                        ig.game.setTitle();
                    });
                }
            });
        },*/
        /*restoreIAP: function() {
            this.iap = this.iap || new Ejecta.IAPManager();
            ig.game.waitingForItunes = true;
            this.iap.restoreTransactions(function(error, transactions) {
                ig.game.waitingForItunes = false;
                if (error) {
                    console.log(error);
                } 
                else {
                    for (var i = 0; i < transactions.length; i++) {
                        if (transactions[i].productId == 'removeAds') {
                            localStorage.setItem('removeAds', true);
                            ig.game.setTitle();
                            return;
                        }
                    }
                }
                ig.game.setTitle();
            });
        }*/
    });
    Kombat.MODE = {
        TITLE: 0,
        GAME: 1,
        GAME_OVER: 2
    };
    Kombat.MULTIPLIER_TIERS = {
        20: 2,
        50: 3
    };
    Kombat.MISSION = {
        MOBILE: {
            fragment: 0,
            mission: 0,
            spawn: [],
            spawnWait: 1,
            healthBoost: 0,
            speedIncrease: 1.01,
            types: [{
                type: EntityEnemyOppressor,
                count: 0,
                incEvery: 9
            }, {
                type: EntityEnemyDestroyer,
                count: 0,
                incEvery: 4
            }, {
                type: EntityEnemyMine,
                count: 3,
                incEvery: 1
            }]
        }, 
        DESKTOP: {
            fragment: 0,
            mission: 0,
            spawn: [],
            spawnWait: 0.7,
            healthBoost: 0,
            speedIncrease: 1.05,
            types: [{
                type: EntityEnemyOppressor,
                count: 0,
                incEvery: 7
            }, {
                type: EntityEnemyDestroyer,
                count: 0,
                incEvery: 3
            }, {
                type: EntityEnemyMine,
                count: 3,
                incEvery: 1
            }]
        }
    };
    var canvas = document.getElementById('kombat-canvas');
    var width = 480;
    var height = 720;
    if (ig.ua.mobile) {
        ig.$('#kombat-gsense').style.display = 'none';
        ig.$('#kombat-byline').style.display = 'none';
        var resize = function() {
            height = Math.min((window.innerHeight / (window.innerWidth)) * width, 852);
            canvas.style.position = 'absolute';
            canvas.style.display = 'block';
            canvas.style.width = window.innerWidth + 'px';
            canvas.style.height = (window.innerWidth / width) * height + 'px';
            canvas.style.bottom = 'auto';
            canvas.style.right = 'auto';
            if (ig.game && ig.system) {
                ig.system.resize(width, height);
            }
        }
        window.addEventListener('resize', function() {
            setTimeout(resize, 500);
        });
        resize();
    }
    ig.System.drawMode = ig.System.DRAW.SUBPIXEL;
    ig.Sound.use = [ig.Sound.FORMAT.OGG, ig.Sound.FORMAT.MP3];
    if (window !== window.top || window.location.href.match(/\?gp=1/)) {
        var ad = ig.$('#kombat-gsense');
        if (ad) {
            ad.className = 'kombat-gsense-full';
        }
    }
    if (window.KombatDocumentMode) {
        ig.doc = new ig.DocumentScanner(document.body);
        if (!ig.ua.mobile) {
            ig.doc.playScanAnimation(function() {
                if (!ig.ua.mobile) {
                    (adsbygoogle = window.adsbygoogle || []).push({});
                }
            });
        }
    }
    ig.main('kombat-canvas', Kombat, 60, width, height, 1, ig.RiseLoader);
});
