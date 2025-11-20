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
        
        // Check if receiveAttack exists
        if (typeof this.players.computer.gameboard.receiveAttack !== 'function') {
            throw new Error('Computer gameboard missing receiveAttack method');
        }
        
        const hit = this.players.computer.gameboard.receiveAttack([x, y]);
        console.log('Attack result - hit:', hit);
        
        this.checkGameOver();
        
        // Only switch turns on a MISS
        if (!hit && !this.gameOver) {
            this.switchTurn();
            return { 
                hit, 
                gameOver: this.gameOver, 
                winner: this.winner,
                turnSwitched: true
            };
        }
        
        return { 
            hit, 
            gameOver: this.gameOver, 
            winner: this.winner,
            turnSwitched: false // Turn doesn't switch on hit
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
      // If no valid attacks, check if game should end
      this.checkGameOver();
      if (!this.gameOver) {
        this.switchTurn(); // Switch back to human if computer can't attack but game isn't over
      }
      return { error: 'No valid attacks remaining' };
    }
    
    console.log('Computer attacking:', attack);
    
    const hit = this.players.human.gameboard.receiveAttack(attack);
    
    console.log('Computer attack result - hit:', hit);
    this.checkGameOver();
    
    // Only switch turns on a MISS
    if (!hit && !this.gameOver) {
      this.switchTurn();
    }
    
    return { 
      attack, 
      hit, 
      gameOver: this.gameOver, 
      winner: this.winner,
      turnSwitched: !hit // Turn switches only on miss
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
    
    // Additional check: if all possible attacks have been made
    const humanAttacks = this.players.human.previousAttacks.size;
    const computerAttacks = this.players.computer.previousAttacks.size;
    const totalPossibleAttacks = 100; // 10x10 grid
    
    if (humanAttacks >= totalPossibleAttacks || computerAttacks >= totalPossibleAttacks) {
      this.gameOver = true;
      // Determine winner by ships remaining
      const humanShipsRemaining = this.players.human.gameboard.ships.filter(ship => !ship.isSunk()).length;
      const computerShipsRemaining = this.players.computer.gameboard.ships.filter(ship => !ship.isSunk()).length;
      
      if (humanShipsRemaining > computerShipsRemaining) {
        this.winner = 'human';
      } else if (computerShipsRemaining > humanShipsRemaining) {
        this.winner = 'computer';
      } else {
        this.winner = 'tie';
      }
      console.log('Game over - All attacks exhausted. Winner:', this.winner);
    }
  }

  initializeComputerShips() {
    const computerShips = [
        { length: 5, coordinates: [0, 0], direction: 'horizontal' },
        { length: 4, coordinates: [2, 0], direction: 'horizontal' },
        { length: 3, coordinates: [4, 0], direction: 'horizontal' },
        { length: 3, coordinates: [6, 0], direction: 'horizontal' },
        { length: 2, coordinates: [8, 0], direction: 'horizontal' }
    ];

    // Clear existing ships first
    this.players.computer.gameboard.ships = [];
    this.players.computer.gameboard.shipPositions = new Map();
    this.players.computer.gameboard.allCoordinates = new Set();

    computerShips.forEach(ship => {
        this.players.computer.gameboard.placeShip(ship.length, ship.coordinates, ship.direction);
    });
    
    console.log('Computer ships initialized:', this.players.computer.gameboard.ships.length);
}

initializeShips() {
    console.log('Initializing human ships...');
    
    // Only initialize if no ships are placed
    if (this.players.human.gameboard.ships.length === 0) {
        const humanShips = [
            { length: 5, coordinates: [0, 5], direction: 'horizontal' },
            { length: 4, coordinates: [2, 5], direction: 'horizontal' },
            { length: 3, coordinates: [4, 5], direction: 'horizontal' },
            { length: 3, coordinates: [6, 5], direction: 'horizontal' },
            { length: 2, coordinates: [8, 5], direction: 'horizontal' }
        ];

        humanShips.forEach(ship => {
            this.players.human.gameboard.placeShip(ship.length, ship.coordinates, ship.direction);
        });
        console.log('Default human ships initialized:', this.players.human.gameboard.ships.length);
    } else {
        console.log('Human ships already placed:', this.players.human.gameboard.ships.length);
    }
}

}