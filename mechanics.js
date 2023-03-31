// define an enemy group to store enemy spaceships
var enemySpaceships = this.physics.add.group();

// spawn a new enemy spaceship every few seconds
this.time.addEvent({
  delay: 2000,
  callback: function() {
    // create a new enemy spaceship and add it to the group
    var enemy = enemySpaceships.create(Phaser.Math.Between(0, 800), 0, 'enemy');

    // set the enemy's velocity and angular velocity
    enemy.setVelocityY(100);
    enemy.setAngularVelocity(Phaser.Math.Between(-200, 200));

    // set the enemy's word to a random word from the word list
    enemy.word = wordList[Math.floor(Math.random() * wordList.length)];
  },
  loop: true
});

// detect collisions between the player and enemy spaceships
this.physics.add.collider(player, enemySpaceships, function(player, enemy) {
  // reduce the player's health and destroy the enemy spaceship
  player.health--;
  enemy.destroy();
});

// detect collisions between the player projectiles and enemy spaceships
this.physics.add.collider(playerProjectiles, enemySpaceships, function(projectile, enemy) {
  // remove the projectile and enemy spaceship from the game
  projectile.destroy();
  enemy.destroy();

  // update the player's score
  player.score += 100;
});

// update the player's health and score text every frame
this.update = function() {
  healthText.setText('Health: ' + player.health);
  scoreText.setText('Score: ' + player.score);
};

function getRandomWord(words) {
    const index = Math.floor(Math.random() * words.length);
    return words[index];
  }
  
  // Example usage:
  const wordList = ['apple', 'banana', 'cherry', 'durian'];
  const randomWord = getRandomWord(wordList);
  console.log(randomWord); // Output: 'cherry' (or another random word from the array)

  function checkWord(typedWord, currentWord) {
    return typedWord === currentWord;
  }
  
  // Example usage:
  const typedWord = 'cherry';
  const currentWord = 'cherry';
  const isMatch = checkWord(typedWord, currentWord);
  console.log(isMatch); // Output: true
  
  