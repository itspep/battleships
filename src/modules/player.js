import Gameboard from './gameboard.js';

export default class Player {
  constructor(type) {
    this.type = type;
    this.gameboard = new Gameboard();
    this.previousAttacks = new Set();
  }

  makeRandomAttack() {
    console.log('makeRandomAttack called, previous attacks:', Array.from(this.previousAttacks));
    
    // If all possible attacks have been made, return null
    if (this.previousAttacks.size >= 100) {
      console.log('All possible attacks made!');
      return null;
    }
    
    let x, y, attackKey;
    let attempts = 0;
    const maxAttempts = 200; // Prevent infinite loop
    
    do {
      x = Math.floor(Math.random() * 10);
      y = Math.floor(Math.random() * 10);
      attackKey = `${x},${y}`;
      attempts++;
      
      if (attempts > maxAttempts) {
        console.error('Failed to find unique attack after', maxAttempts, 'attempts');
        return null;
      }
    } while (this.previousAttacks.has(attackKey));
    
    console.log('Found unique attack:', [x, y], 'after', attempts, 'attempts');
    this.previousAttacks.add(attackKey);
    return [x, y];
  }

  // For human players to make attacks
  makeAttack([x, y]) {
    const attackKey = `${x},${y}`;
    console.log('makeAttack called with:', [x, y], 'previous attacks:', Array.from(this.previousAttacks));
    
    if (this.previousAttacks.has(attackKey)) {
      throw new Error(`Already attacked this coordinate: ${x},${y}`);
    }
    
    this.previousAttacks.add(attackKey);
    console.log('Attack recorded:', attackKey);
    return [x, y];
  }

  // Helper method to check if coordinate was attacked
  hasAttacked([x, y]) {
    return this.previousAttacks.has(`${x},${y}`);
  }

  // Reset attacks for new game
  resetAttacks() {
    this.previousAttacks.clear();
    console.log('Attacks reset');
  }
}