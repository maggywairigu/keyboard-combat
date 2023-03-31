// Create a power-up sprite
let powerUp = this.physics.add.sprite(Phaser.Math.Between(50, 750), 0, 'powerup');

// Enable power-up to be affected by gravity
powerUp.setGravityY(100);

// Add a collider between the player and power-up
this.physics.add.overlap(player, powerUp, collectPowerUp, null, this);

// Callback function when the power-up is collected
function collectPowerUp(player, powerUp) {
  // Apply the power-up effect here
  player.setTint(0xff0000);
  this.time.delayedCall(5000, () => {
    player.clearTint();
  }, [], this);
  
  // Remove the power-up sprite from the scene
  powerUp.destroy();
}

// Create an enemy group
let enemies = this.physics.add.group();

// Create a basic enemy sprite and add it to the group
let enemy = enemies.create(Phaser.Math.Between(50, 750), 0, 'enemy');
enemy.setData('speed', 100);

// Create a zigzag enemy sprite and add it to the group
let zigzagEnemy = enemies.create(Phaser.Math.Between(50, 750), 0, 'zigzagEnemy');
zigzagEnemy.setData('speed', 50);
zigzagEnemy.setData('direction', 1);

// Update the enemy behavior in the update loop
function update(time, delta) {
  enemies.getChildren().forEach(enemy => {
    // Move the enemy down the screen
    enemy.y += enemy.getData('speed') * delta / 1000;
    
    // Check if the enemy is offscreen and destroy it if it is
    if (enemy.y > 600) {
      enemy.destroy();
    }
    
    // Check if the enemy is a zigzag enemy and update its direction
    if (enemy.texture.key === 'zigzagEnemy') {
      if (enemy.x < 50 || enemy.x > 750) {
        enemy.setData('direction', -enemy.getData('direction'));
      }
      
      enemy.x += enemy.getData('direction') * 50 * delta / 1000;
    }
  });
}

// Limit the game's framerate to reduce unnecessary calculations
this.game.config.maxFPS = 60;

// Limit the number of enemies on screen at once
let maxEnemies = 10;
this.time.addEvent({
  delay: 1000,
  loop: true,
  callback: () => {
    if (enemies.getChildren().length < maxEnemies) {
      let enemy = enemies.create(Phaser.Math.Between(50, 750), 0, 'enemy');
      enemy.setData('speed', 100);
    }
  }
});

// Reduce the number of calculations by only updating objects when necessary
function update(time, delta) {
  if (player.getData('isAlive')) {
    // Update player movement and collision detection
    // ...
    
    // Update enemy movement and collision detection
    enemies.getChildren().forEach(enemy => {
      if (enemy.active) {
        // Move the enemy down the screen
        enemy.y += enemy.getData('speed') * delta / 1000;
        
        // Check for collisions between the enemy and player
        this.physics.overlap(player, enemy, playerHit);
      }
    })
}
}