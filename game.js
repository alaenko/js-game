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

class Actor {
  constructor(pos = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
    if (pos.constructor !== Vector) {
      throw "pos не типа Vector";
    } else if (size.constructor !== Vector) {
      throw "size не типа Vector";
    } else if (speed.constructor !== Vector) {
      throw "speed не типа Vector";
    }
    this.pos = pos;
    this.size = size;
    this.speed = speed;
    //this.act();
  }
  
  act() {}

  get left() {
    return this.pos.x;
  }

  get top() {
    return this.pos.y;
  }

  get right() {
    return this.pos.x + this.size.x;
  }

  get bottom() {
    return this.pos.y + this.size.y;
  }

  get type() {
    return 'actor';
  }

  isIntersect(movingActor) {
    if (movingActor.constructor !== Actor || !movingActor) {
      throw "Введите movingActor типа Actor";
    } else if (movingActor === this) {
      return false;
    } else if ((movingActor.left < this.right && movingActor.right > this.left) && (movingActor.bottom > this.top && movingActor.top < this.bottom)) {
      return true;
    }
    return false;
  }
}

const items = new Map();
const player = new Actor();
items.set('Игрок', player);
items.set('Первая монета', new Actor(new Vector(10, 10)));
items.set('Вторая монета', new Actor(new Vector(15, 5)));

function position(item) {
  return ['left', 'top', 'right', 'bottom']
    .map(side => `${side}: ${item[side]}`)
    .join(', ');  
}

function movePlayer(x, y) {
  player.pos = player.pos.plus(new Vector(x, y));
}

function status(item, title) {
  console.log(`${title}: ${position(item)}`);
  if (player.isIntersect(item)) {
    console.log(`Игрок подобрал ${title}`);
  }
}

items.forEach(status);
movePlayer(10, 10);
items.forEach(status);
movePlayer(5, -5);
items.forEach(status);