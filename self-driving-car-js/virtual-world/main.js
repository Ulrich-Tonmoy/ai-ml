canvas.width = 600;
canvas.height = 600;

const ctx = canvas.getContext("2d");

const graphStorage = localStorage.getItem("graph");
const graphData = graphStorage ? JSON.parse(graphStorage) : null;

const graph = graphData ? Graph.load(graphData) : new Graph();
const viewPort = new Viewport(canvas);
const graphEditor = new GraphEditor(viewPort, graph);

animate();

function animate() {
  viewPort.reset();
  graphEditor.display();
  requestAnimationFrame(animate);
}

function dispose() {
  graphEditor.dispose();
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
