const BOARD_CONTAINER = document.getElementById('board');

/**
 * a canvas that fills the board container and whose pixels can be written to
 * individually
 */
export default function Bitmap() {
  // fill the entire container
  const width = BOARD_CONTAINER.offsetWidth;
  const height = BOARD_CONTAINER.offsetHeight;

  // create the canvas element
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#bbb';
  ctx.fillRect(0, 0, width, height);
  let imageData = ctx.getImageData(0, 0, width, height);
  let data = imageData.data;

  // methods
  return {
    get width() {
      return width;
    },

    get height() {
      return height;
    },

    attachToDom() {
      [...BOARD_CONTAINER.children].forEach((child) => child.remove());
      BOARD_CONTAINER.appendChild(canvas);
    },

    repaint() {
      ctx.putImageData(imageData, 0, 0);
    },

    getPixelR(pixelIndex) {
      return data[pixelIndex << 2];
    },

    setPixel(pixelIndex, rgb) {
      const red = pixelIndex << 2;
      data[red] = rgb[0];
      data[red + 1] = rgb[1];
      data[red + 2] = rgb[2];
    },
  };
}
