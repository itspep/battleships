export default class Ship {
    constructor(length) {
      this.length = length;
      this.hits = 0;
      this.sunk = false;
    }
  
    hit() {
      this.hits++;
    }
  
    isSunk() {
      return this.hits >= this.length;
    }
  }