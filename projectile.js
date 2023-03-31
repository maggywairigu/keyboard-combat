// Set the projectile's velocity to move it
projectile.setVelocityY(-400);

// Add collision detection between the projectile and enemies
this.physics.add.collider(projectile, this.enemies, function(projectile, enemy) {
  // Destroy the projectile and enemy
  projectile.destroy();
  enemy.destroy();
});

// Enable physics for the player's projectile and enemies
this.physics.add.existing(playerProjectile, true);
this.enemies.getChildren().forEach(function(enemy) {
  this.physics.add.existing(enemy, true);
});

// Handle collision detection
this.physics.add.overlap(playerProjectile, this.enemies, function(projectile, enemy) {
  // Destroy the enemy and the projectile
  enemy.destroy();
  projectile.destroy();

  // Award points to the player
  score += 100;
  scoreText.setText('Score: ' + score);
});
