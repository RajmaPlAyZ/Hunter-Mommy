import kaboom from "kaboom";
import "kaboom/global";

// Initialize context
kaboom({
  width: window.innerWidth,
  height: window.innerHeight,
  background: [0, 0, 0],
});

const w = window.innerWidth;
const h = window.innerHeight;

function addButton(txt, p, f) {
  // add a parent background object for the button
  const btn = add([
    rect(240, 80, { radius: 8 }),
    pos(p),
    area(),
    scale(1),
    anchor("center"),
    outline(4),
  ]);

  // add a child object that displays the text
  btn.add([
    text(txt),
    anchor("center"),
    color(0, 0, 0),
  ]);

  // onHoverUpdate() comes from area() component
  // it runs every frame when the object is being hovered
  btn.onHoverUpdate(() => {
    const t = time() * 10;
    btn.color = hsl2rgb((t / 10) % 1, 0.6, 0.7);
    btn.scale = vec2(1.2);
    setCursor("pointer");
  });

  // onHoverEnd() comes from area() component
  // it runs once when the object stopped being hovered
  btn.onHoverEnd(() => {
    btn.scale = vec2(1);
    btn.color = rgb();
  });

  // onClick() comes from area() component
  // it runs once when the object is clicked
  btn.onClick(f);

  return btn;
}


// Load Assets
loadSprite("shinchan", "sprites/shinchan.png");
loadSprite("bg", "sprites/bg.png");
loadSprite("walls", "sprites/walls.png");
loadSprite("ghosty", "sprites/ghosty.png");
loadSprite("mBG", "sprites/mBG.jpg");
loadSound("BG-TUNE", "sounds/ShinChan Naughty BGM.mp3");
loadSound("dead", "sounds/dead.mp3");
loadSound("Pew", "sounds/Pew.mp3");



// Custom loading screen
// Runs the callback every frame during loading
onLoading((progress) => {

  // Black background
  drawRect({
    width: width(),
    height: height(),
    color: rgb(0, 0, 0),
  })

  // A pie representing current load progress
  drawCircle({
    pos: center(),
    radius: 32,
    end: map(progress, 0, 1, 0, 360),
  })

  drawText({
    text: "loading" + ".".repeat(wave(1, 4, time() * 12)),
    font: "monospace",
    size: 24,
    anchor: "center",
    pos: center().add(0, 70),
  })

})



// Game scene
scene("game", () => {

  // BACKGROUND TUNE
  const bgMusic = play("BG-TUNE", {
    volume: 0.1, // Adjust the volume as needed
    loop: true, // Loop the music
  });


  // Define the size of your blocks and map
  let blockSize = 64; // Block size is 64x64 pixels
  let mapWidth = width() / blockSize; // Map width is 1920 pixels
  let mapHeight = height() / blockSize; // Map height is 1080 pixels

  // Fill the map
  for (let x = 0; x < mapWidth; x++) {
    for (let y = 0; y < mapHeight; y++) {
      add([
        sprite("bg"),
        pos(x * blockSize, y * blockSize),
      ]);
    }
  }

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




  const ENEMY_SPEED = 160;
  const BULLET_SPEED = 1200;

  const enemy = add([
    sprite("ghosty"),
    pos(width() - 80, height() - 80),
    anchor("center"),
    // This enemy cycles between 3 states, and starts from the "idle" state
    state("move", ["idle", "attack", "move"]),
  ]);

  // Run the callback once every time we enter the "idle" state.
  // Here we stay "idle" for 0.5 seconds, then enter the "attack" state.
  enemy.onStateEnter("idle", async () => {
    await wait(0.5);
    enemy.enterState("attack");
  });

  function restartButton(txt, p, f) {
    // add a parent background object for the button
    const re = add([
      rect(160, 50, { radius: 8 }),
      pos(p),
      area(),
      scale(1),
      anchor("center"),
      outline(4),
    ]);

    // add a child object that displays the text
    re.add([
      text(txt),
      anchor("center"),
      color(0, 0, 0),
    ]);

    // onHoverUpdate() comes from area() component
    // it runs every frame when the object is being hovered
    re.onHoverUpdate(() => {
      const t = time() * 10;
      re.color = hsl2rgb((t / 10) % 1, 0.6, 0.7);
      re.scale = vec2(1.2);
      setCursor("pointer");
    });

    // onHoverEnd() comes from area() component
    // it runs once when the object stopped being hovered
    re.onHoverEnd(() => {
      re.scale = vec2(1);
      re.color = rgb();
    });

    // onClick() comes from area() component
    // it runs once when the object is clicked
    re.onClick(f);

    return re;
  }

  restartButton("Restart", vec2(170, 40), () => {
    location.reload(); // Reload the page 
  });

  enemy.onStateEnter("attack", async () => {
    if (player.exists()) {
      const dir = player.pos.sub(enemy.pos).unit();

      // Play the "Pew" sound on shoot
      play("Pew", {
        volume: 0.3, // Adjust the volume as needed
      });

      add([
        pos(enemy.pos),
        move(dir, BULLET_SPEED),
        rect(12, 12),
        area(),
        offscreen({ destroy: true }),
        anchor("center"),
        color(BLUE),
        "bullet",
      ]);
    }

    await wait(1);
    enemy.enterState("move");
  });

  enemy.onStateEnter("move", async () => {
    await wait(2);
    enemy.enterState("idle");
  });

  enemy.onStateUpdate("move", () => {
    if (!player.exists()) return;
    const dir = player.pos.sub(enemy.pos).unit();
    enemy.move(dir.scale(ENEMY_SPEED));
  });


  player.onCollide("bullet", (bullet) => {
    destroy(bullet);
    destroy(player);
    addKaboom(bullet.pos);
    bgMusic.stop();
    play("dead", {
      volume: 0.3, // Adjust the volume as needed
    });
  });

})


scene("menu", () => {
  // reset cursor to default on frame start for easier cursor management
  onUpdate(() => setCursor("default"));

  // Add a background image to the menu scene
  const backgroundImage = add([
    sprite("mBG"), // Replace "mBG" with the actual image asset name
    pos(0, 0),
  ]);

  // Calculate the scaling factors for width and height
  const scaleX = width() / width(backgroundImage);
  const scaleY = height() / height(backgroundImage);

  // Set the scale of the background image to fit the screen
  scale(backgroundImage, scaleX, scaleY);

  function addButton(txt, p, f) {
    // add a parent background object for the button
    const btn = add([
      rect(240, 80, { radius: 8 }),
      pos(p),
      area(),
      scale(1),
      anchor("center"),
      outline(4),
    ]);

    // add a child object that displays the text
    btn.add([
      text(txt),
      anchor("center"),
      color(0, 0, 0),
    ]);

    // onHoverUpdate() comes from area() component
    // it runs every frame when the object is being hovered
    btn.onHoverUpdate(() => {
      const t = time() * 10;
      btn.color = hsl2rgb((t / 10) % 1, 0.6, 0.7);
      btn.scale = vec2(1.2);
      setCursor("pointer");
    });

    // onHoverEnd() comes from area() component
    // it runs once when the object stopped being hovered
    btn.onHoverEnd(() => {
      btn.scale = vec2(1);
      btn.color = rgb();
    });

    // onClick() comes from area() component
    // it runs once when the object is clicked
    btn.onClick(f);

    return btn;
  }


  addButton("Start", vec2(200, 100), () => startGame()); 
  addButton("Quit", vec2(200, 300), () => {
    debug.log("bye");
    window.close(); // Try to close the tab
  });
  addButton("Credits", vec2(450, 200), () => showCredits());; 
});



function showCredits() {
  go("credits");
}
// Define the startGame function to transition to the "game" scene
function startGame() {
  // Transition to the "game" scene
  go("game");
}

// Start with the "menu" scene
go("menu");


scene("credits", () => {
  // Add a background image to the credits scene
  const backgroundImage = add([
    sprite("mBG"), // Replace "mBG" with the actual image asset name
    pos(0, 0),
  ]);
  // Calculate the scaling factors for width and height
  const scaleX = width() / width(backgroundImage);
  const scaleY = height() / height(backgroundImage);
  // Set the scale of the background image to fit the screen
  scale(backgroundImage, scaleX, scaleY);

  // Add a text label with the credits
  add([
    text("Credits:\n\nGame Design: Vaibhav Bhardwaj\nMD Afaq\nShashwat Mishra\n\nProgramming: Aryan Kaul\n\nTesting: Ajit Chaudhary")
  ]);
  // Add a button to return to the menu
  addButton("Back", vec2(650, 200), () => go("menu"));
});




