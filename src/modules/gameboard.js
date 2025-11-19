import Ship from './ship.js';

export default class Gameboard {
    constructor() {
      this.ships = [];
      this.missedAttacks = [];
      this.shipPositions = new Map(); // Track ship positions
    }
  
    placeShip(length, [startX, startY], direction) {
      const ship = new Ship(length);
      this.ships.push(ship);
      
      // Calculate and store ship coordinates
      const coordinates = [];
      for (let i = 0; i < length; i++) {
        if (direction === 'horizontal') {
          coordinates.push([startX, startY + i]);
        } else {
          coordinates.push([startX + i, startY]);
        }
      }
      
      this.shipPositions.set(ship, coordinates);
      return ship;
    }
  
    getShipCoordinates(ship) {
      return this.shipPositions.get(ship) || [];
    }

    receiveAttack([x, y]) {
        for (const [ship, coordinates] of this.shipPositions) {
          for (const [shipX, shipY] of coordinates) {
            if (shipX === x && shipY === y) {
              ship.hit();
              return true; // Hit
            }
          }
        }
        
        // If no ship was hit, record missed attack
        this.missedAttacks.push([x, y]);
        return false; // Miss
      }

      allShipsSunk() {
        return this.ships.every(ship => ship.isSunk());
      }
  }