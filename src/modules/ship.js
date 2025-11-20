export default class Ship {
    constructor(length) {
      this.length = length;
      this.hits = 0;
    }
  
    hit() {
      this.hits++;
      console.log(`Ship hit! Hits: ${this.hits}/${this.length}`);
    }
  
    isSunk() {
      return this.hits >= this.length;
    }
  }