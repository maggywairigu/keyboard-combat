// Create a keyboard input manager
let keyboard = this.input.keyboard;

// Handle keyboard input
keyboard.on('keydown', function(event) {
  // Get the key that was pressed
  let key = event.key;

  // Check if the key is a letter in the current word
  if (currentWord.includes(key)) {
    // Remove the letter from the current word
    currentWord = currentWord.replace(key, '');

    // Update the word text display
    wordText.setText(currentWord);
  }
});

// listen for keyboard input
this.input.keyboard.on('keydown', function(event) {
    // get the pressed key
    let key = event.key;
    
    // handle the key press
    if (key === 'A') {
      console.log('A key pressed!');
    } else if (key === 'B') {
      console.log('B key pressed!');
    }
  });
  