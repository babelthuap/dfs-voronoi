import Bitmap from './Bitmap.js';
import {dist, pair, rand} from './util.js';

// reuse these across instances to reduce garbage collection time
const dfsStack = [];
let cellsArray;
let pixelsArray;

// color
const BORDER_RGB = Uint8ClampedArray.of(0, 0, 0);
const BORDER_R = BORDER_RGB[0];

const PARAMS = new URLSearchParams(location.search);
const NUM_CELLS = parseInt(PARAMS.get('n') || 200);
const SPEED = parseInt(PARAMS.get('s') || 200);

/** naive algorithm to find closest cell for a pixel */
const findClosestCell = (pixelIndex, width, cells) => {
  const x = pixelIndex % width;
  const y = (pixelIndex - x) / width;
  let closestCellIndex;
  let minDist = Infinity;
  for (let i = 0; i < cells.length; ++i) {
    const cell = cells[i];
    const d = dist(x, y, cell.x, cell.y);
    if (d < minDist) {
      minDist = d;
      closestCellIndex = i;
    }
  }
  return closestCellIndex;
};

/**
 * a rendered set of cells with adjacency determined by voronoi rules
 */
export default function Voronoi() {
  // init bitmap
  const bitmap = new Bitmap();
  const width = bitmap.width;
  const height = bitmap.height;

  // place cells
  const cells = (() => {
    if (cellsArray === undefined) {
      cellsArray = new Array(NUM_CELLS);
    } else if (cellsArray.length !== NUM_CELLS) {
      cellsArray.length = NUM_CELLS;
    }
    const cells = cellsArray;
    const centers = new Set();
    // thirds - so we don't place cells in adjacent pixels
    for (let id = 0; id < NUM_CELLS; ++id) {
      let x, y;
      do {
        x = rand(width);
        y = rand(height);
      } while (centers.has(pair(x, y)));
      centers.add(pair(x, y));
      cells[id] = {x, y};
    }
    return cells;
  })();

  // initialize pixels array (map from coordinates to cell id)
  const numPixels = height * width;
  const pixels = (() => {
    if (pixelsArray === undefined) {
      pixelsArray = new Array(numPixels);
    } else {
      const oldLength = pixelsArray.length;
      if (pixelsArray.length !== numPixels) {
        pixelsArray.length = numPixels;
      }
      pixelsArray.fill(undefined, 0, oldLength);
    }
    return pixelsArray;
  })();

  // top edge
  for (let index = 0; index < width; ++index) {
    pixels[index] = -1;
    bitmap.setPixel(index, BORDER_RGB);
  }
  // bottom edge
  for (let index = width * (height - 1); index < width * height; ++index) {
    pixels[index] = -1;
    bitmap.setPixel(index, BORDER_RGB);
  }
  // left edge
  for (let index = 0; index < width * (height - 1); index += width) {
    pixels[index] = -1;
    bitmap.setPixel(index, BORDER_RGB);
  }
  // right edge
  for (let index = width - 1; index < width * height; index += width) {
    pixels[index] = -1;
    bitmap.setPixel(index, BORDER_RGB);
  }

  // define helper methods
  const calcPixel = (pixelIndex) => {
    const id = pixels[pixelIndex];
    return id === undefined ?
        pixels[pixelIndex] = findClosestCell(pixelIndex, width, cells) :
        id;
  };
  const startOfBottomRow = width * (height - 1);
  const isBorderPixel = (pixelIndex) => {
    // check edges
    if (pixelIndex >= startOfBottomRow) {
      return false;
    }
    const x = pixelIndex % width;
    if (x < 0 || x === width - 1) {
      return false;
    }
    // check neighbors
    const y = (pixelIndex - x) / width;
    const id = calcPixel(pixelIndex);
    return (x > 0 && id !== calcPixel(pixelIndex - 1)) ||          // left
        (x < width - 1 && id !== calcPixel(pixelIndex + 1)) ||     // right
        (y > 0 && id !== calcPixel(pixelIndex - width)) ||         // up
        (y < height - 1 && id !== calcPixel(pixelIndex + width));  // down
  };

  // attach bitmap so we can start drawing
  bitmap.attachToDom();

  // draw borders with a DFS
  const neighborIndicess =
      [-(width + 1), -width, -(width - 1), -1, 1, width - 1, width, width + 1];
  async function animate() {
    bitmap.setPixel(width, BORDER_RGB);
    dfsStack.push(width);
    let count = 0;
    while (dfsStack.length > 0) {
      const pixelIndex = dfsStack.pop();
      for (let i = 0; i < neighborIndicess.length; ++i) {
        const nbr = pixelIndex + neighborIndicess[i];
        const nbrPixelR = bitmap.getPixelR(nbr);
        if (nbrPixelR !== BORDER_R && isBorderPixel(nbr)) {
          bitmap.setPixel(pixelIndex, BORDER_RGB);
          count++;
          dfsStack.push(nbr);
        }
      }
      if (count > SPEED) {
        count = 0;
        await new Promise((resolve) => {
          requestAnimationFrame(() => {
            bitmap.repaint();
            resolve();
          });
        });
      }
    }
    bitmap.repaint();
  }

  return animate();
}
