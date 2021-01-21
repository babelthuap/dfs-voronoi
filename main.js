import Voronoi from './Voronoi.js';

let renderInProgress;

const render = () => {
  renderInProgress = true;
  new Voronoi().then(() => renderInProgress = false);
};

render();

window.addEventListener('keydown', event => {
  if (!renderInProgress && !event.ctrlKey) {
    console.log('render');
    render();
  }
});
