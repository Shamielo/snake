import './style.css';
import { startGame } from './game.js';

// Make startGame and handleControl available globally
window.startGame = startGame;

// Start the game when the page loads
startGame();