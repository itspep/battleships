export default class DOM {
    constructor(game) {
        this.game = game;
        this.initializeElements();
        this.setupEventListeners();
        this.currentShip = null;
        this.currentDirection = 'horizontal';
        this.placedShips = new Set();
        
        // Initial render
        this.createShipList();
        this.renderBoards();
    }

    initializeElements() {
        console.log('Initializing DOM elements...');
        
        // Boards
        this.playerBoard = document.getElementById('playerBoard');
        this.computerBoard = document.getElementById('computerBoard');
        
        // UI Elements
        this.turnIndicator = document.getElementById('turnIndicator');
        this.gameStatus = document.getElementById('gameStatus');
        this.shipList = document.getElementById('shipList');
        this.playerShipStatus = document.getElementById('playerShipStatus');
        this.computerShipStatus = document.getElementById('computerShipStatus');
        
        // Buttons
        this.rotateBtn = document.getElementById('rotateBtn');
        this.randomBtn = document.getElementById('randomBtn');
        this.startBtn = document.getElementById('startBtn');
        this.resetBtn = document.getElementById('resetBtn');
        
        // Modal
        this.modal = document.getElementById('gameOverModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalMessage = document.getElementById('modalMessage');
        this.playAgainBtn = document.getElementById('playAgainBtn');

        console.log('Elements initialized:', {
            playerBoard: !!this.playerBoard,
            computerBoard: !!this.computerBoard,
            turnIndicator: !!this.turnIndicator
        });
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' || e.key === 'R') {
                this.rotateShip();
            }
        });

        // Button events
        this.rotateBtn.addEventListener('click', () => this.rotateShip());
        this.randomBtn.addEventListener('click', () => this.randomizeShips());
        this.startBtn.addEventListener('click', () => this.startGame());
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.playAgainBtn.addEventListener('click', () => this.resetGame());

        console.log('Event listeners setup complete');
    }

    createShipList() {
        const ships = [
            { name: 'Carrier', length: 5 },
            { name: 'Battleship', length: 4 },
            { name: 'Cruiser', length: 3 },
            { name: 'Submarine', length: 3 },
            { name: 'Destroyer', length: 2 }
        ];

        this.shipList.innerHTML = '';
        ships.forEach(ship => {
            const shipItem = document.createElement('div');
            shipItem.className = 'ship-item';
            shipItem.dataset.length = ship.length;
            shipItem.dataset.name = ship.name;
            
            const shipPreview = document.createElement('div');
            shipPreview.className = 'ship-preview';
            
            for (let i = 0; i < ship.length; i++) {
                const segment = document.createElement('div');
                segment.className = 'ship-segment';
                shipPreview.appendChild(segment);
            }
            
            const shipName = document.createElement('span');
            shipName.textContent = ship.name;
            
            shipItem.appendChild(shipPreview);
            shipItem.appendChild(shipName);
            
            shipItem.addEventListener('click', () => {
                console.log('Ship selected:', ship.name);
                this.selectShip(ship);
            });
            
            this.shipList.appendChild(shipItem);
        });
    }

    selectShip(ship) {
        if (this.placedShips.has(ship.name)) {
            console.log('Ship already placed:', ship.name);
            return;
        }

        // Remove previous selection
        document.querySelectorAll('.ship-item').forEach(item => {
            item.classList.remove('placing');
        });

        // Set new selection
        this.currentShip = ship;
        const shipElement = document.querySelector(`[data-name="${ship.name}"]`);
        if (shipElement) {
            shipElement.classList.add('placing');
        }

        this.gameStatus.textContent = `Placing ${ship.name} - Click on your board to place`;
        console.log('Ship ready for placement:', ship.name);
    }

    rotateShip() {
        this.currentDirection = this.currentDirection === 'horizontal' ? 'vertical' : 'horizontal';
        this.gameStatus.textContent = `Ship direction: ${this.currentDirection}`;
        console.log('Ship direction changed to:', this.currentDirection);
    }

    renderBoards() {
        console.log('Rendering boards...');
        this.renderPlayerBoard();
        this.renderComputerBoard();
        this.updateShipStatus();
    }

    renderPlayerBoard() {
        console.log('Rendering player board...');
        this.playerBoard.innerHTML = '';
        
        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 10; y++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                // Check if cell has a ship
                const hasShip = this.checkIfCellHasShip(x, y, 'human');
                if (hasShip) {
                    cell.classList.add('ship');
                }
                
                // Check if cell was attacked
                const wasAttacked = this.checkIfCellWasAttacked(x, y, 'human');
                if (wasAttacked) {
                    cell.classList.add(hasShip ? 'hit' : 'miss');
                }
                
                cell.addEventListener('click', (e) => {
                    console.log('Player board clicked:', x, y);
                    this.placeShip(x, y);
                });
                
                this.playerBoard.appendChild(cell);
            }
        }
        console.log('Player board rendered with', this.playerBoard.children.length, 'cells');
    }

    renderComputerBoard() {
        console.log('Rendering computer board...');
        this.computerBoard.innerHTML = '';
        
        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 10; y++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                // Only show hits and misses on computer board
                const wasAttacked = this.checkIfCellWasAttacked(x, y, 'computer');
                if (wasAttacked) {
                    const hasShip = this.checkIfCellHasShip(x, y, 'computer');
                    cell.classList.add(hasShip ? 'hit' : 'miss');
                }
                
                cell.addEventListener('click', (e) => {
                    console.log('Computer board clicked:', x, y, 'Game over:', this.game.gameOver, 'Current player:', this.game.currentPlayer);
                    if (!this.game.gameOver && this.game.currentPlayer === 'human') {
                        this.attackComputer(x, y);
                    } else {
                        console.log('Click ignored - Game over:', this.game.gameOver, 'Current player:', this.game.currentPlayer);
                    }
                });
                
                this.computerBoard.appendChild(cell);
            }
        }
        console.log('Computer board rendered with', this.computerBoard.children.length, 'cells');
    }

    checkIfCellHasShip(x, y, player) {
        const gameboard = this.game.players[player].gameboard;
        if (!gameboard.shipPositions) return false;
        
        for (const [ship, coordinates] of gameboard.shipPositions) {
            for (const [shipX, shipY] of coordinates) {
                if (shipX === x && shipY === y) {
                    return true;
                }
            }
        }
        return false;
    }

    checkIfCellWasAttacked(x, y, player) {
        const enemyType = player === 'human' ? 'computer' : 'human';
        const enemyPlayer = this.game.players[enemyType];
        return enemyPlayer.previousAttacks.has(`${x},${y}`);
    }

    placeShip(x, y) {
        console.log('Attempting to place ship at:', x, y, 'Current ship:', this.currentShip);
        
        if (!this.currentShip) {
            console.log('No ship selected');
            this.gameStatus.textContent = 'Please select a ship first!';
            return;
        }

        if (this.placedShips.has(this.currentShip.name)) {
            console.log('Ship already placed:', this.currentShip.name);
            return;
        }

        try {
            this.game.players.human.gameboard.placeShip(
                this.currentShip.length,
                [x, y],
                this.currentDirection
            );
            
            this.placedShips.add(this.currentShip.name);
            console.log('Ship placed successfully:', this.currentShip.name);
            this.renderPlayerBoard();
            
            // Select next unplaced ship
            const nextShip = Array.from(document.querySelectorAll('.ship-item'))
                .find(item => !this.placedShips.has(item.dataset.name));
            
            if (nextShip) {
                this.selectShip({
                    name: nextShip.dataset.name,
                    length: parseInt(nextShip.dataset.length)
                });
            } else {
                this.currentShip = null;
                this.startBtn.disabled = false;
                this.gameStatus.textContent = 'All ships placed! Click "Start Game" to begin.';
                console.log('All ships placed');
            }
        } catch (error) {
            console.error('Placement error:', error);
            this.gameStatus.textContent = 'Invalid placement! Try different coordinates.';
        }
    }

    randomizeShips() {
        console.log('Randomizing ships...');
        
        // Clear existing ships
        this.game.players.human.gameboard.ships = [];
        this.game.players.human.gameboard.shipPositions = new Map();
        this.placedShips.clear();
        
        const ships = [
            { name: 'Carrier', length: 5 },
            { name: 'Battleship', length: 4 },
            { name: 'Cruiser', length: 3 },
            { name: 'Submarine', length: 3 },
            { name: 'Destroyer', length: 2 }
        ];

        ships.forEach(ship => {
            let placed = false;
            let attempts = 0;
            const maxAttempts = 100;
            
            while (!placed && attempts < maxAttempts) {
                const x = Math.floor(Math.random() * 10);
                const y = Math.floor(Math.random() * 10);
                const direction = Math.random() > 0.5 ? 'horizontal' : 'vertical';
                
                try {
                    this.game.players.human.gameboard.placeShip(ship.length, [x, y], direction);
                    this.placedShips.add(ship.name);
                    placed = true;
                    console.log('Random placement successful:', ship.name, 'at', x, y, direction);
                } catch (error) {
                    attempts++;
                }
            }
            
            if (!placed) {
                console.error('Failed to place ship after', maxAttempts, 'attempts:', ship.name);
            }
        });

        this.renderPlayerBoard();
        this.startBtn.disabled = false;
        this.gameStatus.textContent = 'Ships randomly placed! Click "Start Game" to begin.';
        console.log('Random placement complete');
    }

    attackComputer(x, y) {
        console.log('Attacking computer at:', x, y);
        
        if (this.game.gameOver) {
            console.log('Game is over, cannot attack');
            return;
        }

        if (this.game.currentPlayer !== 'human') {
            console.log('Not human turn, cannot attack');
            return;
        }

        const result = this.game.humanAttack([x, y]);
        console.log('Attack result:', result);
        
        if (result.error) {
            this.gameStatus.textContent = result.error;
            return;
        }

        this.renderBoards();
        this.updateGameStatus();
        
        if (result.gameOver) {
            this.showGameOver(result.winner);
        }
    }

    updateGameStatus() {
        const currentPlayer = this.game.currentPlayer;
        this.turnIndicator.textContent = currentPlayer === 'human' ? 'Your Turn' : 'Computer\'s Turn';
        console.log('Updating game status, current player:', currentPlayer);
        
        if (currentPlayer === 'computer' && !this.game.gameOver) {
            this.gameStatus.textContent = 'Computer is thinking...';
            console.log('Computer turn starting...');
            
            // Simulate computer thinking delay
            setTimeout(() => {
                console.log('Computer making attack...');
                const result = this.game.computerAttack();
                console.log('Computer attack result:', result);
                
                this.renderBoards();
                this.updateGameStatus();
                
                if (result && result.gameOver) {
                    this.showGameOver(result.winner);
                }
            }, 1000);
        } else {
            this.gameStatus.textContent = 'Your turn - Attack enemy waters!';
        }
    }

    updateShipStatus() {
        this.updatePlayerShipStatus();
        this.updateComputerShipStatus();
    }

    updatePlayerShipStatus() {
        this.playerShipStatus.innerHTML = '';
        this.game.players.human.gameboard.ships.forEach(ship => {
            const statusItem = document.createElement('div');
            statusItem.className = 'ship-status-item';
            
            const indicator = document.createElement('div');
            indicator.className = `ship-indicator ${ship.isSunk() ? 'sunk' : ''}`;
            
            const text = document.createElement('span');
            text.textContent = ship.isSunk() ? 'Sunk' : 'Afloat';
            
            statusItem.appendChild(indicator);
            statusItem.appendChild(text);
            this.playerShipStatus.appendChild(statusItem);
        });
    }

    updateComputerShipStatus() {
        this.computerShipStatus.innerHTML = '';
        const sunkShips = this.game.players.computer.gameboard.ships.filter(ship => ship.isSunk()).length;
        const totalShips = this.game.players.computer.gameboard.ships.length;
        
        const statusItem = document.createElement('div');
        statusItem.className = 'ship-status-item';
        
        const text = document.createElement('span');
        text.textContent = `Enemy ships sunk: ${sunkShips}/${totalShips}`;
        
        statusItem.appendChild(text);
        this.computerShipStatus.appendChild(statusItem);
    }

    startGame() {
        console.log('Starting game...');
        
        if (this.placedShips.size < 5) {
            this.gameStatus.textContent = 'Place all ships before starting!';
            console.log('Not all ships placed:', this.placedShips.size);
            return;
        }
    
        // Only initialize computer ships, don't override human ships
        this.game.initializeComputerShips();
        this.gameStatus.textContent = 'Game started! Attack enemy waters.';
        this.startBtn.disabled = true;
        this.renderBoards();
        this.updateGameStatus();
        console.log('Game started successfully - Human ships:', this.game.players.human.gameboard.ships.length);
    }

    resetGame() {
        console.log('Resetting game...');
        
        // Create a new game instance
        this.game = new (this.game.constructor)();
        this.currentShip = null;
        this.currentDirection = 'horizontal';
        this.placedShips.clear();
        
        // Reset UI elements
        if (this.modal) this.modal.classList.remove('show');
        if (this.startBtn) this.startBtn.disabled = true;
        
        this.createShipList();
        this.renderBoards();
        
        if (this.gameStatus) this.gameStatus.textContent = 'Place your ships to start';
        if (this.turnIndicator) this.turnIndicator.textContent = 'Your Turn';
        
        console.log('Game reset complete');
      }

    showGameOver(winner) {
        console.log('Game over, winner:', winner);
        this.modalTitle.textContent = winner === 'human' ? 'Victory! 🎉' : 'Defeat! 💥';
        this.modalMessage.textContent = winner === 'human' 
            ? 'Congratulations! You sunk all enemy ships!'
            : 'The computer sunk all your ships. Better luck next time!';
        this.modal.classList.add('show');
    }

    attackComputer(x, y) {
        console.log('Attacking computer at:', x, y);
        
        if (this.game.gameOver) {
            console.log('Game is over, cannot attack');
            this.showGameOver(this.game.winner);
            return;
        }
    
        if (this.game.currentPlayer !== 'human') {
            console.log('Not human turn, current player:', this.game.currentPlayer);
            this.gameStatus.textContent = `Not your turn! It's ${this.game.currentPlayer}'s turn.`;
            return;
        }
    
        const result = this.game.humanAttack([x, y]);
        console.log('Attack result:', result);
        
        if (result.error) {
            this.gameStatus.textContent = result.error;
            return;
        }
    
        this.renderBoards();
        
        // If game is over after human attack, show game over
        if (result.gameOver) {
            this.showGameOver(result.winner);
        } else if (result.turnSwitched) {
            // Only trigger computer turn if turn was switched (on miss)
            this.updateGameStatus();
        } else if (result.hit) {
            // If hit, player gets another turn - update status but don't switch
            this.gameStatus.textContent = 'Hit! Take another shot!';
            this.turnIndicator.textContent = 'Your Turn (Extra)';
        }
    }
    
    updateGameStatus() {
        const currentPlayer = this.game.currentPlayer;
        this.turnIndicator.textContent = currentPlayer === 'human' ? 'Your Turn' : 'Computer\'s Turn';
        console.log('Updating game status, current player:', currentPlayer);
        
        if (currentPlayer === 'computer' && !this.game.gameOver) {
            this.gameStatus.textContent = 'Computer is thinking...';
            console.log('Computer turn starting...');
            
            // Simulate computer thinking delay
            setTimeout(() => {
                console.log('Computer making attack...');
                const result = this.game.computerAttack();
                console.log('Computer attack result:', result);
                
                this.renderBoards();
                
                if (result && result.gameOver) {
                    this.showGameOver(result.winner);
                } else if (result && result.turnSwitched) {
                    // Computer missed - switch back to human
                    this.turnIndicator.textContent = 'Your Turn';
                    this.gameStatus.textContent = 'Computer missed! Your turn.';
                } else if (result && result.hit) {
                    // Computer hit - gets another turn
                    this.turnIndicator.textContent = 'Computer\'s Turn (Extra)';
                    this.gameStatus.textContent = 'Computer hit your ship! Computer gets another turn.';
                    // Recursively call updateGameStatus for computer's extra turn
                    setTimeout(() => this.updateGameStatus(), 1000);
                } else {
                    // Fallback
                    this.turnIndicator.textContent = 'Your Turn';
                    this.gameStatus.textContent = 'Your turn - Attack enemy waters!';
                }
            }, 1000);
        } else {
            this.gameStatus.textContent = 'Your turn - Attack enemy waters!';
        }
    }
    
    // Update the showGameOver method to handle ties
    showGameOver(winner) {
        console.log('Game over, winner:', winner);
        
        if (winner === 'tie') {
            this.modalTitle.textContent = 'Game Over - Tie!';
            this.modalMessage.textContent = 'All ships sunk! It\'s a tie game!';
        } else {
            this.modalTitle.textContent = winner === 'human' ? 'Victory! 🎉' : 'Defeat! 💥';
            this.modalMessage.textContent = winner === 'human' 
                ? 'Congratulations! You sunk all enemy ships!'
                : 'The computer sunk all your ships. Better luck next time!';
        }
        
        this.modal.classList.add('show');
    }

    rotateShip() {
        this.currentDirection = this.currentDirection === 'horizontal' ? 'vertical' : 'horizontal';
        this.gameStatus.textContent = `Ship direction: ${this.currentDirection}`;
        console.log('Ship direction changed to:', this.currentDirection);
        
        // Update UI feedback
        if (this.rotateBtn) {
            this.rotateBtn.textContent = `Rotate Ship (R) - ${this.currentDirection}`;
        }
    }

    updateShipStatus() {
        this.updatePlayerShipStatus();
        this.updateComputerShipStatus();
    }
    
    updatePlayerShipStatus() {
        this.playerShipStatus.innerHTML = '<h4>Your Ships</h4>';
        const playerShips = this.game.players.human.gameboard.ships;
        const playerSunkShips = playerShips.filter(ship => ship.isSunk()).length;
        
        const statusItem = document.createElement('div');
        statusItem.className = 'ship-status-item';
        statusItem.textContent = `Sunk: ${playerSunkShips}/${playerShips.length}`;
        this.playerShipStatus.appendChild(statusItem);
    }
    
    updateComputerShipStatus() {
        this.computerShipStatus.innerHTML = '<h4>Enemy Ships</h4>';
        const computerShips = this.game.players.computer.gameboard.ships;
        const computerSunkShips = computerShips.filter(ship => ship.isSunk()).length;
        
        const statusItem = document.createElement('div');
        statusItem.className = 'ship-status-item';
        statusItem.textContent = `Sunk: ${computerSunkShips}/${computerShips.length}`;
        this.computerShipStatus.appendChild(statusItem);
    }

    updateShipStatus() {
        this.updatePlayerShipStatus();
        this.updateComputerShipStatus();
    }
    
    updatePlayerShipStatus() {
        this.playerShipStatus.innerHTML = '<h4>Your Ships</h4>';
        const playerShips = this.game.players.human.gameboard.ships;
        const playerSunkShips = playerShips.filter(ship => ship.isSunk()).length;
        
        const statusItem = document.createElement('div');
        statusItem.className = 'ship-status-item';
        statusItem.textContent = `Sunk: ${playerSunkShips}/${playerShips.length}`;
        this.playerShipStatus.appendChild(statusItem);
    }
    
    updateComputerShipStatus() {
        this.computerShipStatus.innerHTML = '<h4>Enemy Ships</h4>';
        const computerShips = this.game.players.computer.gameboard.ships;
        const computerSunkShips = computerShips.filter(ship => ship.isSunk()).length;
        
        const statusItem = document.createElement('div');
        statusItem.className = 'ship-status-item';
        statusItem.textContent = `Sunk: ${computerSunkShips}/${computerShips.length}`;
        this.computerShipStatus.appendChild(statusItem);
    } 
}