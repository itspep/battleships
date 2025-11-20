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
        
        // Initialize computer ships immediately
        this.initializeComputerShips();
      }
      
      // Separate method for computer ships
      initializeComputerShips() {
        const computerShips = [
          { length: 5, coordinates: [0, 5], direction: 'horizontal' },
          { length: 4, coordinates: [2, 5], direction: 'horizontal' },
          { length: 3, coordinates: [4, 5], direction: 'horizontal' },
          { length: 3, coordinates: [6, 5], direction: 'horizontal' },
          { length: 2, coordinates: [8, 5], direction: 'horizontal' }
        ];
      
        computerShips.forEach(ship => {
          this.players.computer.gameboard.placeShip(ship.length, ship.coordinates, ship.direction);
        });
        
        console.log('Computer ships initialized');
      }
      
      // Update initializeShips to only handle human ships
      initializeShips() {
        console.log('Initializing human ships...');
        
        // Predefined ship placements for human
        const humanShips = [
          { length: 5, coordinates: [0, 0], direction: 'horizontal' },
          { length: 4, coordinates: [2, 0], direction: 'horizontal' },
          { length: 3, coordinates: [4, 0], direction: 'horizontal' },
          { length: 3, coordinates: [6, 0], direction: 'horizontal' },
          { length: 2, coordinates: [8, 0], direction: 'horizontal' }
        ];
      
        humanShips.forEach(ship => {
          this.players.human.gameboard.placeShip(ship.length, ship.coordinates, ship.direction);
        });
      
        console.log('Human ships initialized');
      }

  switchTurn() {
    this.currentPlayer = this.currentPlayer === 'human' ? 'computer' : 'human';
    console.log('Turn switched to:', this.currentPlayer);
  }

  humanAttack([x, y]) {
    console.log('humanAttack called with:', [x, y]);
    
    if (this.gameOver) {
      console.log('Game over, cannot attack');
      return { error: 'Game is over' };
    }

    if (this.currentPlayer !== 'human') {
      console.log('Not human turn, current player:', this.currentPlayer);
      return { error: 'Not your turn' };
    }

    try {
      this.players.human.makeAttack([x, y]);
      const hit = this.players.computer.gameboard.receiveAttack([x, y]);
      console.log('Attack result - hit:', hit);
      
      this.checkGameOver();
      
      if (!this.gameOver) {
        this.switchTurn();
        // Don't call computerAttack here - let DOM handle it
      }
      
      return { 
        hit, 
        gameOver: this.gameOver, 
        winner: this.winner,
        turnSwitched: true
      };
    } catch (error) {
      console.log('Attack error:', error.message);
      return { error: error.message };
    }
  }

  computerAttack() {
    console.log('computerAttack called');
    
    if (this.gameOver || this.currentPlayer !== 'computer') {
      console.log('Computer cannot attack - game over:', this.gameOver, 'current player:', this.currentPlayer);
      return null;
    }
  
    const attack = this.players.computer.makeRandomAttack();
    
    if (!attack) {
      console.log('Computer could not find valid attack');
      this.switchTurn(); // Switch back to human if computer can't attack
      return { error: 'No valid attacks remaining' };
    }
    
    console.log('Computer attacking:', attack);
    
    // Note: makeRandomAttack already records the attack in previousAttacks
    // So we don't need to call makeAttack again
    const hit = this.players.human.gameboard.receiveAttack(attack);
    
    console.log('Computer attack result - hit:', hit);
    this.checkGameOver();
    
    if (!this.gameOver) {
      this.switchTurn();
    }
    
    return { 
      attack, 
      hit, 
      gameOver: this.gameOver, 
      winner: this.winner 
    };
  }

  checkGameOver() {
    const humanAllSunk = this.players.human.gameboard.allShipsSunk();
    const computerAllSunk = this.players.computer.gameboard.allShipsSunk();
    
    console.log('Checking game over - Human sunk:', humanAllSunk, 'Computer sunk:', computerAllSunk);
    
    if (humanAllSunk) {
      this.gameOver = true;
      this.winner = 'computer';
      console.log('Game over - Computer wins!');
    } else if (computerAllSunk) {
      this.gameOver = true;
      this.winner = 'human';
      console.log('Game over - Human wins!');
    }
  }

  // Initialize ships for both players
  initializeShips() {
    console.log('Initializing ships for both players');
    
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

    console.log('Ships initialized for both players');
  }
}