canvas.width = 1000;
canvas.height = 600;

const ctx = canvas.getContext("2d");

let generate = false;

const worldStorage = LZString.decompress(localStorage.getItem("world"));
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
  generate: {
    button: generateBtn,
    editor: {
      enable: () => {
        generate = true;
      },
      disable: () => {
        generate = false;
      },
    },
  },
};

let oldGraphHash = graph.hash();

setEditor("graph");
animate();

function animate() {
  viewport.reset();
  // add another variable to toggle generation
  if (graph.hash() !== oldGraphHash && generate) {
    world.generate();
    oldGraphHash = graph.hash();
  }
  const viewPoint = scale(viewport.getOffset(), -1);
  world.draw(ctx, viewPoint);
  ctx.globalAlpha = 0.3;
  for (const tool of Object.values(tools)) {
    tool.editor.display && tool.editor.display();
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
  localStorage.setItem("world", LZString.compress(JSON.stringify(world)));
}

function saveJSON() {
  world.zoom = viewport.zoom;
  world.offset = viewport.offset;

  const a = document.createElement("a");
  const data = JSON.stringify(world, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  a.href = URL.createObjectURL(blob);
  a.setAttribute("download", "world.world");
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
    localStorage.setItem("world", LZString.compress(JSON.stringify(world)));
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

function openOsmPanel() {
  osmPanel.style.display = "block";
}

function closeOsmPanel() {
  osmPanel.style.display = "none";
}

function parseOsmData() {
  if (osmDataContainer.value === "") {
    alert("Paste Your Data");
    return;
  }

  const res = Osm.parseRoads(JSON.parse(osmDataContainer.value));
  graph.points = res.points;
  graph.segments = res.segments;

  closeOsmPanel();
}

function toggleInfo(enable = false) {
  if (enable) infoPanel.style.display = "block";
  else infoPanel.style.display = "none";
}

function copyToClipboard() {
  navigator.clipboard.writeText(codeText);

  alert("Copied to Clipboard");
}

const codeText = `
[out:json];
(
  way['highway']
  ['highway' !~'pedestrian']
  ['highway' !~'footway']
  ['highway' !~'cycleway']
  ['highway' !~'path']
  ['highway' !~'service']
  ['highway' !~'corridor']
  ['highway' !~'track']
  ['highway' !~'steps']
  ['highway' !~'raceway']
  ['highway' !~'bridleway']
  ['highway' !~'proposed']
  ['highway' !~'construction']
  ['highway' !~'elevator']
  ['highway' !~'bus_guideway']
  ['highway' !~'private']
  ['highway' !~'no']
  ({{bbox}});
);
out body;
>;
out skel;
`;
