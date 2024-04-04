canvas.width = 1000;
canvas.height = 600;

const ctx = canvas.getContext("2d");

const worldStorage = localStorage.getItem("world");
const worldData = worldStorage ? JSON.parse(worldStorage) : null;
let world = worldData ? World.load(worldData) : new World(new Graph());
const graph = world.graph;

const viewport = new Viewport(canvas, world.zoom, world.offset);
const tools = {
  graph: { button: graphBtn, editor: new GraphEditor(viewport, graph) },
  stop: { button: stopBtn, editor: new StopEditor(viewport, world) },
  crossing: { button: crossingBtn, editor: new CrossingEditor(viewport, world) },
  start: { button: startBtn, editor: new StartEditor(viewport, world) },
  parking: { button: parkingBtn, editor: new ParkingEditor(viewport, world) },
  light: { button: lightBtn, editor: new LightEditor(viewport, world) },
  target: { button: targetBtn, editor: new TargetEditor(viewport, world) },
  yield: { button: yieldBtn, editor: new YieldEditor(viewport, world) },
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
  world.zoom = viewport.zoom;
  world.offset = viewport.offset;
  localStorage.setItem("world", JSON.stringify(world));
}

function saveJSON() {
  world.zoom = viewport.zoom;
  world.offset = viewport.offset;

  const a = document.createElement("a");
  const data = JSON.stringify(world, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  a.href = URL.createObjectURL(blob);
  a.setAttribute("download", "world.json");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function load(event) {
  const file = event.target.files[0];
  if (!file) {
    alert("No file selected");
    return;
  }

  const reader = new FileReader();
  reader.readAsText(file);

  reader.onload = (e) => {
    const content = e.target.result;
    const data = JSON.parse(content);
    world = World.load(data);
    localStorage.setItem("world", JSON.stringify(world));
    location.reload();
  };
}

function setEditor(mode) {
  for (const tool of Object.values(tools)) {
    tool.editor.disable();
    tool.button.classList.add("disabled");
  }

  tools[mode].editor.enable();
  tools[mode].button.classList.remove("disabled");
}
