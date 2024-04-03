canvas.width = 1000;
canvas.height = 600;

const ctx = canvas.getContext("2d");

const graphStorage = localStorage.getItem("graph");
const graphData = graphStorage ? JSON.parse(graphStorage) : null;

const graph = graphData ? Graph.load(graphData) : new Graph();
const world = new World(graph);

const viewport = new Viewport(canvas);
const tools = {
  graph: { button: graphBtn, editor: new GraphEditor(viewport, graph) },
  stop: { button: stopBtn, editor: new StopEditor(viewport, world) },
  crossing: { button: crossingBtn, editor: new CrossingEditor(viewport, world) },
  start: { button: startBtn, editor: new StartEditor(viewport, world) },
};

let oldGraphHash = graph.hash();

setEditor("graph");
animate();

function animate() {
  viewport.reset();
  if (graph.hash() !== oldGraphHash) {
    world.generate();
    oldGraphHash = graph.hash();
  }
  const viewPoint = scale(viewport.getOffset(), -1);
  world.draw(ctx, viewPoint);
  ctx.globalAlpha = 0.3;
  for (const tool of Object.values(tools)) {
    tool.editor.display();
  }
  requestAnimationFrame(animate);
}

/* --------------------------------- Controls --------------------------------- */
function dispose() {
  tools["graph"].editor.dispose();
  world.markings.length = 0;
}

function disposeLocalStorage() {
  localStorage.clear();
}

function save() {
  localStorage.setItem("graph", JSON.stringify(graph));
}

function saveJSON() {
  const a = document.createElement("a");
  const data = JSON.stringify(graph, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  a.href = URL.createObjectURL(blob);
  a.setAttribute("download", "graph.json");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function setEditor(mode) {
  for (const tool of Object.values(tools)) {
    tool.editor.disable();
    tool.button.classList.add("disabled");
  }

  tools[mode].editor.enable();
  tools[mode].button.classList.remove("disabled");
}
