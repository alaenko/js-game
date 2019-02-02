'use strict';

class Vector {
  constructor(xCoord = 0, yCoord = 0) {
    this.x = xCoord;
    this.y = yCoord;   
  }

  plus(vector) {
    if (vector.constructor !== Vector) {
      throw "Можно прибавлять к вектору только вектор типа Vector";
    }
    return new Vector(this.x + vector.x, this.y + vector.y);
  }

  times(multiplier) {
    return new Vector(this.x * multiplier, this.y * multiplier);
  }
}

const start = new Vector(30, 50);
const moveTo = new Vector(5, 10);
const finish = start.plus(moveTo.times(2));

console.log(`Исходное расположение: ${start.x}:${start.y}`);
console.log(`Текущее расположение: ${finish.x}:${finish.y}`);

