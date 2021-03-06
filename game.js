'use strict';

class Vector {
  constructor(xCoord = 0, yCoord = 0) {
    this.x = xCoord;
    this.y = yCoord;   
  }

  plus(vector) {
    if (!(vector instanceof Vector)) {
      throw new Error("Можно прибавлять к вектору только вектор типа Vector");
    }
    return new Vector(this.x + vector.x, this.y + vector.y);
  }

  times(multiplier) {
    return new Vector(this.x * multiplier, this.y * multiplier);
  }
}


////////////////////////////////////////

class Actor {
  constructor(pos = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
    if (!(pos instanceof Vector)) {
      throw new Error("pos не типа Vector");
    } else if (!(size instanceof Vector)) {
      throw new Error("size не типа Vector");
    } else if (!(speed instanceof Vector)) {
      throw new Error("speed не типа Vector");
    }
    this.pos = pos;
    this.size = size;
    this.speed = speed;
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
    if (!(movingActor instanceof Actor) || !movingActor) {
      throw new Error("Введите movingActor типа Actor");
    } else if (movingActor === this) {
        return false;
    } else if ((movingActor.left < this.right && movingActor.right > this.left) && (movingActor.bottom > this.top && movingActor.top < this.bottom)) {
        return true;
    }
    return false;
  }
}


////////////////////////////////////////

class Level {
  constructor(grid, actors) {
    this.grid = grid;
    this.actors = actors;
    this.status = null;
    this.finishDelay = 1;
  }

  get player() {
    for (let i = 0 ; i < this.actors.length ; i++) {
      if (this.actors[i].type === 'player') return this.actors[i];
    }
  } 

  get height() {
    if (!this.grid) {
      return 0;
    } else {
      return this.grid.length;
    }
  }

  get width() {
    if (!this.grid) {
      return 0;
    } else {
      let max = 0;
      this.grid.forEach(function(line) {
        if (line.length > max) {
          max = line.length;
        }
      });
      return max;
    }
  
  }

  isFinished() {
    return (this.status !== null && this.finishDelay < 0) ? true : false;
  }

  actorAt(actor) {
    if (!(actor instanceof Actor) || !actor) {
      throw new Error("Введите actor типа Actor");
    } else if (!this.actors || this.actors.length === 1) {
      return undefined;
    } else {
        return this.actors.find((el) => el.isIntersect(actor));
    }
  }

  obstacleAt(pos, size) {
    if (pos.constructor.name !== 'Vector') {
      throw new Error("pos не типа Vector");
    } else if (size.constructor.name !== 'Vector') {
      throw new Error("size не типа Vector");
    }
    if ((pos.y + size.y) > this.height) return 'lava';
    if (pos.x + size.x > this.width || pos.y < 0 || pos.x < 0) return 'wall';
    for (let i = Math.floor(pos.x); i < Math.ceil(pos.x + size.x); i++) {
      for (let j = Math.floor(pos.y); j < Math.ceil(pos.y + size.y); j++) {
        if ((this.grid[j][i] == 'lava') || (this.grid[j][i] == 'wall')) {
          return this.grid[j][i];
        }
      }
    }
    return undefined;
  }

  removeActor(actor) {
    let find = this.actors.findIndex(function (el) {
      return el === actor;
    });
    if (find !== -1) this.actors.splice(find, 1);
  }

  noMoreActors(obgType) {
    if (!this.actors) return true;
    let find = this.actors.findIndex(function (el) {
      if (el.type === obgType) return el;
    });
    if (find === -1) {
      return true;
    } else {
      return false;
    }
  }

  playerTouched(type, actor) {
    if (this.status !== null) return;
    if (type === 'lava' || type === 'fireball') this.status = 'lost';
    if (type === 'coin') {
      this.removeActor(actor);
      if (this.noMoreActors('coin')) this.status = 'won';
    }

  }
}


////////////////////////////////////////

class LevelParser {
  constructor(symbols) {
    this.symbols = symbols;
  }

  actorFromSymbol(symbol) {
    if (!symbol) {
      return undefined;
    } else {
      return this.symbols[symbol];
    }
  }

  obstacleFromSymbol(symbol) {
    if (symbol === 'x') {
        return 'wall';
    } else if (symbol === '!') {
        return 'lava';
    } else {
        return undefined;
    }
}

  createGrid(arr) {
    return arr.map( (arrEl) => { return arrEl.split('').map( (el) => { return this.obstacleFromSymbol(el) }) })
  }  


  createActors(arr) {
    let result = [];
    if (this.symbols) {
      arr.forEach((line,lineIndex) => {
        line.split('').forEach((col,colIndex) => {
          let getActor = this.actorFromSymbol(col);
            if (getActor !== undefined && typeof(getActor) == 'function') {
              let actor = new getActor(new Vector(colIndex,lineIndex));
               if (actor instanceof Actor) {
                 result.push(actor);
               }
            }
        });
      });
    }
    return result;
  }

  parse(arr) {
    let grid = this.createGrid(arr);
    let actors = this.createActors(arr);
    return new Level(grid, actors);
  }

}


////////////////////////////////////////

class Fireball extends Actor {
  constructor(pos = new Vector(0,0), speed = new Vector(0,0)) {
    super(...arguments);
    this.pos = pos;
    this.speed = speed;
    this.size = new Vector(1, 1);
  }

  get type() {
    return 'fireball';
  }

  getNextPosition(time = 1) {
    return new Vector(this.pos.x + time * this.speed.x, this.pos.y + time * this.speed.y);
  }

  handleObstacle() {
    this.speed.x = - this.speed.x;
    this.speed.y = - this.speed.y;
  }

  act(time, level) {
    let nextPosition = this.getNextPosition(time);
    if(level.obstacleAt(nextPosition, this.size)) {
      this.handleObstacle();
    } else {
      this.pos = nextPosition;
    }
  } 

}


  ////////////////////////////////////////

  class HorizontalFireball extends Fireball {
    constructor(pos) {
      super(pos);
      this.speed =  new Vector(2, 0);
    }
  }


   ////////////////////////////////////////

   class VerticalFireball extends Fireball {
    constructor(pos) {
      super(pos);
      this.speed =  new Vector(0, 2);
    }
  }


  ////////////////////////////////////////

  class FireRain extends Fireball {
    constructor(pos) {
      super(pos);
      this.speed = new Vector(0, 3);
      this.startPos = pos;
    }

    handleObstacle() {
      this.pos = this.startPos;
    }
  }


  ////////////////////////////////////////

  class Coin extends Actor {
    constructor(pos = new Vector(0,0)) {
      super(...arguments);
      this.size = new Vector(0.6, 0.6);
      this.pos = new Vector(pos.x + 0.2, pos.y + 0.1);
      this.springSpeed = 8;
      this.springDist = 0.07;
      this.spring = Math.random() * (2 * Math.PI);
      this.startPosition = new Vector(this.pos.x, this.pos.y);
    }

    get type() {
      return 'coin';
    }

    updateSpring(time = 1) {
      this.spring += this.springSpeed * time;
    }

    getSpringVector() {
      return new Vector(0, Math.sin(this.spring) * this.springDist);
    }

    getNextPosition(time = 1) {
      this.updateSpring(time);
      return new Vector(this.pos.x, this.startPosition.y + this.getSpringVector().y);
    } 

    act(time) {
      this.pos = this.getNextPosition(time);
    }

  }


  ////////////////////////////////////////

  class Player extends Actor {
    constructor(pos = new Vector(0,0)) {
      super(...arguments);
      this.pos  = new Vector(pos.x, pos.y - 0.5);
      this.speed = new Vector(0, 0);
      this.size = new Vector(0.8, 1.5);
    }

    get type() {
      return 'player';
    }
  }


  ////////////////////////////////////////

  const schemas = [
    [
      '          o ',
      '            ',
      '         xxx',
      '       =    ',
      '       x  o ',
      '            ',
      ' @          ',
      'xxx    !xxxx',
      '         '
    ],
    [
      '            ',
      '   o        ',
      '@         o ',
      'xxx xxx     ',
      '       =    ',
      '          o ',
      '          x ',
      '            ',
      '!!!!!!!!!!!!'
    ],
    [
      '                   ',
      '   o        v      ',
      '                 o ',
      'xxx   xxx          ',
      '          =  o     ',
      '   o               ',
      '  xx             x ',
      '         @       x ',
      '         x       x ',
      '             o   x ',
      '!!!!!!!!!!!!!!!!!x!'
    ],
    [
      '   v                   o    v',
      '    o     =  o       |       ',
      '            xxxx             ',
      '@                      x  ooo',
      'xxxxxxxxx         xxxxxxxxxxo',
      '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'
    ]
  ];

  const actorDict = {
    '@': Player,
    'o': Coin,
    '=': HorizontalFireball,
    '|': VerticalFireball,
    'v': FireRain
  }
  loadLevels();
  const parser = new LevelParser(actorDict);
  runGame(schemas, parser, DOMDisplay)
    .then(() => console.log('Вы выиграли приз!'));


