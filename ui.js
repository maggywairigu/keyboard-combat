// Create a score display
let score = 0;
let scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });
score += 100;
scoreText.setText('Score: ' + score);

// Create a health bar
let healthBar = this.add.graphics();
healthBar.fillStyle(0xff0000, 1);
healthBar.fillRect(0, 0, 100, 10);
healthBar.x = 16;
healthBar.y = 60;
playerHealth -= 10;
if (playerHealth <= 0) {
  // Player is dead, end the game
  this.scene.start('GameOverScene');
} else {
  // Update the health bar
  healthBar.clear();
  healthBar.fillStyle(0xff0000, 1);
  healthBar.fillRect(0, 0, playerHealth, 10);
}
