import Player from './player.js';

export default class Game {
  constructor() {
    this.players = {
      human: new Player('human'),
      computer: new Player('computer')
    };
    this.currentPlayer = 'human';
    this.gameOver = false;
    this.winner = null;
  }

  switchTurn() {
    this.currentPlayer = this.currentPlayer === 'human' ? 'computer' : 'human';
  }

  humanAttack([x, y]) {
    if (this.gameOver || this.currentPlayer !== 'human') {
      return false;
    }

    try {
      this.players.human.makeAttack([x, y]);
      const hit = this.players.computer.gameboard.receiveAttack([x, y]);
      
      this.checkGameOver();
      if (!this.gameOver) {
        this.switchTurn();
        this.computerAttack();
      }
      
      return { hit, gameOver: this.gameOver, winner: this.winner };
    } catch (error) {
      return { error: error.message };
    }
  }

  computerAttack() {
    if (this.gameOver || this.currentPlayer !== 'computer') {
      return;
    }

    const attack = this.players.computer.makeRandomAttack();
    this.players.computer.makeAttack(attack);
    const hit = this.players.human.gameboard.receiveAttack(attack);
    
    this.checkGameOver();
    if (!this.gameOver) {
      this.switchTurn();
    }
    
    return { attack, hit, gameOver: this.gameOver, winner: this.winner };
  }

  checkGameOver() {
    if (this.players.human.gameboard.allShipsSunk()) {
      this.gameOver = true;
      this.winner = 'computer';
    } else if (this.players.computer.gameboard.allShipsSunk()) {
      this.gameOver = true;
      this.winner = 'human';
    }
  }

  // Initialize ships for both players
  initializeShips() {
    // Predefined ship placements for demo
    const humanShips = [
      { length: 5, coordinates: [0, 0], direction: 'horizontal' },
      { length: 4, coordinates: [2, 0], direction: 'horizontal' },
      { length: 3, coordinates: [4, 0], direction: 'horizontal' },
      { length: 3, coordinates: [6, 0], direction: 'horizontal' },
      { length: 2, coordinates: [8, 0], direction: 'horizontal' }
    ];

    const computerShips = [
      { length: 5, coordinates: [0, 5], direction: 'horizontal' },
      { length: 4, coordinates: [2, 5], direction: 'horizontal' },
      { length: 3, coordinates: [4, 5], direction: 'horizontal' },
      { length: 3, coordinates: [6, 5], direction: 'horizontal' },
      { length: 2, coordinates: [8, 5], direction: 'horizontal' }
    ];

    humanShips.forEach(ship => {
      this.players.human.gameboard.placeShip(ship.length, ship.coordinates, ship.direction);
    });

    computerShips.forEach(ship => {
      this.players.computer.gameboard.placeShip(ship.length, ship.coordinates, ship.direction);
    });
  }
}