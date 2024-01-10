# Kaboom.js


## Description

Kaboom.js is a lightweight JavaScript library for creating explosive and dynamic user interfaces. It provides an easy-to-use sets of commands for handling animations, events, and more, making it a powerful tool for building interactive games.

## Features

- **Explosive Animations**: Easily create dynamic and engaging animations to enhance user experience.
- **Event Handling**: Simple and effective event handling for user interactions.
- **Responsive Design**: Ensure your UI works seamlessly across various screen sizes and devices.
- **Modular Architecture**: Build and organize your code in a modular way for better maintainability.
- **Lightweight**: Keep your web pages fast and responsive with a minimal footprint.

## Installation

You can install kaboom.js using npm:

```bash
npm install kaboom

-----------------

# CODE 
# Kaboom.js Maze Game [Hunter Mommy]

## Overview

This project is a maze game built using the Kaboom.js game development library. It features a menu scene with options to start the game, view credits, or quit. The game scene involves a player navigating through a dynamically generated maze while avoiding enemy attacks.

## Game Controls

- **Keyboard:**
  - Arrow keys or WASD for movement.

- **Mobile (Touch):**
  - Click on the screen to move the player in the maze.

## Scenes

1. **Menu:**
   - Start the game.
   - View credits.
   - Quit the game.

2. **Game:**
   - Navigate through a dynamically generated maze.
   - Avoid enemy attacks.
   - Restart the game with the provided button.

3. **Credits:**
   - Display credits for the game.
   - Return to the main menu.

## Customization

- **Assets:**
  - Customize game assets by replacing the provided images and sounds in the `sprites` and `sounds` directories.

- **Maze Generation:**
  - Explore and modify the maze generation algorithm in the `createMazeMap` function for different maze layouts.

## Acknowledgments

This project is based on the Kaboom.js library, utilizing the Replit starter template for Kaboom.js game development.

## Contributors

- Game Development: Aryan Kaul
- Contribution: Vaibhav Bhardwaj
- Faculty Guide: Mr. Krashnakant Gupta

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

-----------------

## Map Generation Logic
---

  const TILE_WIDTH = 64;
  const TILE_HEIGHT = 64;

  // Adjust the width and height of the maze to fill a 1920x1080 page
  const MAZE_WIDTH = Math.floor(width() / TILE_WIDTH);
  const MAZE_HEIGHT = Math.floor(height() / TILE_HEIGHT);

  function createMazeMap(width, height) {
    const size = width * height;

    function getUnvisitedNeighbours(map, index) {
      const n = [];
      const x = Math.floor(index / width);
      if (x > 1 && map[index - 2] === 2) n.push(index - 2);
      if (x < width - 2 && map[index + 2] === 2) n.push(index + 2);
      if (index >= 2 * width && map[index - 2 * width] === 2) n.push(index - 2 * width);
      if (index < size - 2 * width && map[index + 2 * width] === 2) n.push(index + 2 * width);
      return n;
    }

    const map = new Array(size).fill(1, 0, size);
    map.forEach((_, index) => {
      const x = Math.floor(index / width);
      const y = Math.floor(index % width);
      if ((x & 1) === 1 && (y & 1) === 1) {
        map[index] = 2;
      }
    });

    const stack = [];
    const startX = Math.floor(Math.random() * (width - 1)) | 1;
    const startY = Math.floor(Math.random() * (height - 1)) | 1;
    const start = startX + startY * width;
    map[start] = 0;
    stack.push(start);
    while (stack.length) {
      const index = stack.pop();
      const neighbours = getUnvisitedNeighbours(map, index);
      if (neighbours.length > 0) {
        stack.push(index);
        const neighbour = neighbours[Math.floor(neighbours.length * Math.random())];
        const between = (index + neighbour) / 2;
        map[neighbour] = 0;
        map[between] = 0;
        stack.push(neighbour);
      }
    }

    return map;
  }

  function createMazeLevelMap(width, height, options) {
    const symbols = options?.symbols || {};
    const map = createMazeMap(width, height);
    const space = symbols[" "] || " ";
    const fence = symbols["#"] || "#";
    const detail = [
      space,
      symbols["╸"] || "╸", //  1
      symbols["╹"] || "╹", //  2
      symbols["┛"] || "┛", //  3
      symbols["╺"] || "╺", //  4
      symbols["━"] || "━", //  5
      symbols["┗"] || "┗", //  6
      symbols["┻"] || "┻", //  7
      symbols["╻"] || "╻", //  8
      symbols["┓"] || "┓", //  9
      symbols["┃"] || "┃", //  a
      symbols["┫"] || "┫", //  b
      symbols["┏"] || "┏", //  c
      symbols["┳"] || "┳", //  d
      symbols["┣"] || "┣", //  e
      symbols["╋ "] || "╋ ", //  f
    ];
    const symbolMap = options?.detailed
      ? map.map((s, index) => {
          if (s === 0) return space;
          const x = Math.floor(index % width);
          const leftWall = x > 0 && map[index - 1] == 1 ? 1 : 0;
          const rightWall = x < width - 1 && map[index + 1] == 1 ? 4 : 0;
          const topWall = index >= width && map[index - width] == 1 ? 2 : 0;
          const bottomWall = index < height * width - width && map[index + width] == 1 ? 8 : 0;
          return detail[leftWall | rightWall | topWall | bottomWall];
        })
      : map.map((s) => {
          return s == 1 ? fence : space;
        });
    const levelMap = [];
    for (let i = 0; i < height; i++) {
      levelMap.push(symbolMap.slice(i * width, i * width + width).join(""));
    }
    return levelMap;
  }

  const level = addLevel(
    createMazeLevelMap(MAZE_WIDTH, MAZE_HEIGHT, {}), // Use the adjusted maze dimensions
    {
      tileWidth: TILE_WIDTH,
      tileHeight: TILE_HEIGHT,
      tiles: {
        "#": () => [
          sprite("walls"),
          area(),
          body({isStatic: true}),
        ],
      },
    }
  );


# Maze Generation and Rendering

This code provides a simple implementation of maze generation and rendering using the [JavaScript game development library Kaboom.js](https://kaboomjs.com/).

## Constants

- `TILE_WIDTH` and `TILE_HEIGHT` define the dimensions of each maze tile.
- `MAZE_WIDTH` and `MAZE_HEIGHT` adjust the width and height of the maze to fill a 1920x1080 page.

## Maze Generation

The `createMazeMap` function generates a maze using a modified depth-first search algorithm. The maze is represented as a 2D array where `0` represents a path, and `1` represents a wall. The function uses a stack to create a maze by carving passages through the walls.

## Maze Rendering

The `createMazeLevelMap` function converts the generated maze into a visual representation. It takes into account optional symbols for different elements of the maze, such as spaces and fences. The detailed option allows for a more intricate representation with various symbols for walls.

## Kaboom.js Integration

The generated maze is then added as a level in Kaboom.js using the `addLevel` function. The level is rendered with specified tile dimensions, and walls are represented using the "#" symbol. Kaboom.js entities are utilized to display walls with the "walls" sprite, define collision areas, and set static bodies.

## Usage

1. Include the Kaboom.js library in your project.
2. Copy and paste the provided code into your project.
3. Customize the symbols and options in `createMazeLevelMap` as needed.
4. Adjust the `addLevel` function to fit your game's requirements.

Feel free to experiment with different symbols, tile dimensions, and rendering options to create unique mazes for your game!

---

## Charachter Movement
---

loadSprite("shinchan", "sprites/shinchan.png");

  // PLAYER
  const SPEED = 300;
  const player = add([
    sprite("shinchan"),
    pos(90,80),
    scale(0.098),
    area(),
    body(),
  ]);

  // MOVEMENT CODE

  onKeyDown("left", () => {
    player.move(-SPEED, 0);
  });

  onKeyDown("right", () => {
    player.move(SPEED, 0);
  });

  onKeyDown("up", () => {
    player.move(0, -SPEED);
  });

  onKeyDown("down", () => {
    player.move(0, SPEED);
  });

  onKeyDown("a", () => {
    player.move(-SPEED, 0);
  });

  onKeyDown("d", () => {
    player.move(SPEED, 0);
  });

  onKeyDown("w", () => {
    player.move(0, -SPEED);
  });

  onKeyDown("s", () => {
    player.move(0, SPEED);
  });

  onClick(() => {
    player.moveTo(mousePos());
  });

  // Mobile controls
  let touchStartPos = new Vec2(0, 0);

  onTouchStart((pos, t) => {
    touchStartPos = pos;
  });

  onTouchMove((pos, t) => {
    const deltaX = pos.x - touchStartPos.x;
    const deltaY = pos.y - touchStartPos.y;

    // Adjust sensitivity based on your needs
    const touchSensitivity = 8000;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal movement
      if (deltaX > touchSensitivity) {
        player.pos.x += SPEED;
      } else if (deltaX < -touchSensitivity) {
        player.pos.x -= SPEED;
      }
    } else {
      // Vertical movement
      if (deltaY > touchSensitivity) {
        player.pos.y += SPEED;
      } else if (deltaY < -touchSensitivity) {
        player.pos.y -= SPEED;
      }
    }

    // Update touchStartPos for the next frame
    touchStartPos = pos;
  });

Certainly! Here's an explanation you can include in your `readme.md` file to help others understand the code:

---

# Shinchan Game Controls

This code snippet demonstrates the player controls for a simple game featuring Shinchan using the [Kaboom.js](https://kaboomjs.com/) game development library. It includes both keyboard and mobile controls for player movement.

## Player Setup

```javascript
loadSprite("shinchan", "sprites/shinchan.png");

const SPEED = 300;
const player = add([
  sprite("shinchan"),
  pos(90, 80),
  scale(0.098),
  area(),
  body(),
]);
```

The code initializes the Shinchan player character with a sprite, initial position, scale, an area for collision detection, and a physics body.

## Keyboard Controls

```javascript
onKeyDown("left", () => {
  player.move(-SPEED, 0);
});

onKeyDown("right", () => {
  player.move(SPEED, 0);
});

onKeyDown("up", () => {
  player.move(0, -SPEED);
});

onKeyDown("down", () => {
  player.move(0, SPEED);
});

onKeyDown("a", () => {
  player.move(-SPEED, 0);
});

onKeyDown("d", () => {
  player.move(SPEED, 0);
});

onKeyDown("w", () => {
  player.move(0, -SPEED);
});

onKeyDown("s", () => {
  player.move(0, SPEED);
});


## Keyboard Controls

The code sets up keyboard controls for moving the player character in four directions (left, right, up, and down) using both arrow keys and WASD keys.

## Mobile Controls

The code sets up touch controls for mobile devices. It records the starting position when a touch begins and adjusts the player's position based on the swipe direction, providing a simple and intuitive mobile gaming experience.

---

# HOSTING

You can deploy the application by simple building the attached dockerfile.

---
sudo docker build . -t my-game
sudo docker run -p 8000:8000 "container_id"
---

Make sure you have node installed.
