// Load your assets
function preload() {
    this.load.image('background', 'assets/background.png');
    this.load.image('ship', 'assets/ship.png');
    this.load.image('enemy', 'assets/enemy.png');
    this.load.image('bullet', 'assets/bullet.png');
  }
  
  // Create your game objects and sprites
  function create() {
    // Create the background
    this.add.image(0, 0, 'background').setOrigin(0);
  
    // Create the player's ship
    this.player = this.add.sprite(400, 550, 'ship');
  
    // Create the enemies
    this.enemies = this.add.group({
      key: 'enemy',
      repeat: 4,
      setXY: { x: 100, y: 50, stepX: 100 },
    });
  
    // Create the bullets
    this.bullets = this.physics.add.group({
      key: 'bullet',
      repeat: 10,
      setXY: { x: 0, y: -50, stepX: 70 },
    });
  }

  // Create a projectile sprite with physics
let projectile = this.physics.add.sprite(x, y, 'projectile');


