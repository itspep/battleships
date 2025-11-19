import Gameboard from './gameboard.js';

export default class Player {
    constructor(type) {
      this.type = type;
      this.gameboard = new Gameboard();
      this.previousAttacks = new Set();
    }
  
    makeRandomAttack() {
      let x, y, attackKey;
      
      // Keep generating until we find a new attack
      do {
        x = Math.floor(Math.random() * 10);
        y = Math.floor(Math.random() * 10);
        attackKey = `${x},${y}`;
      } while (this.previousAttacks.has(attackKey));
      
      this.previousAttacks.add(attackKey);
      return [x, y];
    }
  
    // For human players to make attacks
    makeAttack([x, y]) {
      const attackKey = `${x},${y}`;
      if (this.previousAttacks.has(attackKey)) {
        throw new Error('Already attacked this coordinate');
      }
      
      this.previousAttacks.add(attackKey);
      return [x, y];
    }
  }