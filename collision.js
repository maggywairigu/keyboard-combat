// create a player sprite
let player = this.physics.add.sprite(100, 100, 'player');

// create an enemy sprite
let enemy = this.physics.add.sprite(200, 200, 'enemy');

// enable collision detection between the player and enemy sprites
this.physics.add.collider(player, enemy, function() {
  console.log('collision detected!');
});

// enable physics for the player and enemy groups
this.physics.add.group(playerProjectiles);
this.physics.add.group(enemySpaceships);

// detect collisions between the player projectiles and enemy spaceships
this.physics.add.collider(playerProjectiles, enemySpaceships, function(projectile, spaceship) {
  // remove the projectile and spaceship from the game
  projectile.destroy();
  spaceship.destroy();
});
