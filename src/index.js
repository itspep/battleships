import './styles/main.css';
import Game from './modules/game.js';
import DOM from './modules/dom.js';

// Initialize the game
const game = new Game();
const dom = new DOM(game);

// Make game available globally for debugging
window.game = game;