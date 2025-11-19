export default class DOM {
    constructor(game) {
        this.game = game;
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
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

        // Game state
        this.currentShip = null;
        this.currentDirection = 'horizontal';
        this.placedShips = new Set();
    }

    setupEventListeners() {
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

        // Initial setup
        this.createShipList();
        this.renderBoards();
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
            
            shipItem.addEventListener('click', () => this.selectShip(ship));
            this.shipList.appendChild(shipItem);
        });
    }

    selectShip(ship) {
        if (this.placedShips.has(ship.name)) return;

        // Remove previous selection
        document.querySelectorAll('.ship-item').forEach(item => {
            item.classList.remove('placing');
        });

        // Set new selection
        this.currentShip = ship;
        const shipElement = document.querySelector(`[data-name="${ship.name}"]`);
        shipElement.classList.add('placing');

        this.gameStatus.textContent = `Placing ${ship.name} - Click on your board to place`;
    }

    rotateShip() {
        this.currentDirection = this.currentDirection === 'horizontal' ? 'vertical' : 'horizontal';
        this.gameStatus.textContent = `Ship direction: ${this.currentDirection}`;
    }

    renderBoards() {
        this.renderPlayerBoard();
        this.renderComputerBoard();
        this.updateShipStatus();
    }

    renderPlayerBoard() {
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
                
                cell.addEventListener('click', () => this.placeShip(x, y));
                this.playerBoard.appendChild(cell);
            }
        }
    }

    renderComputerBoard() {
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
                
                if (!this.game.gameOver && this.game.currentPlayer === 'human') {
                    cell.addEventListener('click', () => this.attackComputer(x, y));
                }
                
                this.computerBoard.appendChild(cell);
            }
        }
    }

    checkIfCellHasShip(x, y, player) {
        const gameboard = this.game.players[player].gameboard;
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
        if (!this.currentShip || this.placedShips.has(this.currentShip.name)) return;

        try {
            this.game.players.human.gameboard.placeShip(
                this.currentShip.length,
                [x, y],
                this.currentDirection
            );
            
            this.placedShips.add(this.currentShip.name);
            this.renderPlayerBoard();
            
            // Select next unplaced ship
            const nextShip = Array.from(document.querySelectorAll('.ship-item'))
                .find(item => !this.placedShips.has(item.dataset.name));
            
            if (nextShip) {
                nextShip.click();
            } else {
                this.currentShip = null;
                this.startBtn.disabled = false;
                this.gameStatus.textContent = 'All ships placed! Click "Start Game" to begin.';
            }
        } catch (error) {
            this.gameStatus.textContent = 'Invalid placement! Try different coordinates.';
        }
    }

    randomizeShips() {
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
            while (!placed) {
                const x = Math.floor(Math.random() * 10);
                const y = Math.floor(Math.random() * 10);
                const direction = Math.random() > 0.5 ? 'horizontal' : 'vertical';
                
                try {
                    this.game.players.human.gameboard.placeShip(ship.length, [x, y], direction);
                    this.placedShips.add(ship.name);
                    placed = true;
                } catch (error) {
                    // Try again with new coordinates
                }
            }
        });

        this.renderPlayerBoard();
        this.startBtn.disabled = false;
        this.gameStatus.textContent = 'Ships randomly placed! Click "Start Game" to begin.';
    }

    attackComputer(x, y) {
        if (this.game.gameOver || this.game.currentPlayer !== 'human') return;

        const result = this.game.humanAttack([x, y]);
        
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
        
        if (currentPlayer === 'computer') {
            this.gameStatus.textContent = 'Computer is thinking...';
            // Simulate computer thinking delay
            setTimeout(() => {
                const result = this.game.computerAttack();
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
        if (this.placedShips.size < 5) {
            this.gameStatus.textContent = 'Place all ships before starting!';
            return;
        }

        this.game.initializeShips();
        this.gameStatus.textContent = 'Game started! Attack enemy waters.';
        this.startBtn.disabled = true;
        this.renderBoards();
        this.updateGameStatus();
    }

    resetGame() {
        this.game = new (this.game.constructor)();
        this.currentShip = null;
        this.currentDirection = 'horizontal';
        this.placedShips.clear();
        this.modal.classList.remove('show');
        this.startBtn.disabled = true;
        
        this.createShipList();
        this.renderBoards();
        this.gameStatus.textContent = 'Place your ships to start';
        this.turnIndicator.textContent = 'Your Turn';
    }

    showGameOver(winner) {
        this.modalTitle.textContent = winner === 'human' ? 'Victory! 🎉' : 'Defeat! 💥';
        this.modalMessage.textContent = winner === 'human' 
            ? 'Congratulations! You sunk all enemy ships!'
            : 'The computer sunk all your ships. Better luck next time!';
        this.modal.classList.add('show');
    }
}