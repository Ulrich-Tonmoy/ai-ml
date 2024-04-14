carCanvas.width = window.innerWidth - 330;
networkCanvas.width = 300;
miniMapCanvas.width = 300;
miniMapCanvas.height = 300;

carCanvas.height = window.innerHeight;
networkCanvas.height = window.innerHeight - 300;

const carCTX = carCanvas.getContext("2d");
const networkCTX = networkCanvas.getContext("2d");

const worldStorage = localStorage.getItem("world");
const worldData = worldStorage ? JSON.parse(worldStorage) : null;
let world = worldData ? World.load(worldData) : new World(new Graph());
const viewport = new Viewport(carCanvas, world.zoom, world.offset);

const miniMap = new MiniMap(miniMapCanvas, world.graph, 300);

const aiCarNumbers = 150;
const cars = generateCars(aiCarNumbers);
let bestCar = cars[0];
getBestBrain();

const traffic = [];
const roadBorders = world.roadBorders.map((s) => [s.p1, s.p2]);

animate();
function animate(time) {
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].update(roadBorders, []);
  }

  for (let i = 0; i < cars.length; i++) {
    cars[i].update(roadBorders, traffic);
  }

  bestCar = cars.find((c) => c.fitness === Math.max(...cars.map((c) => c.fitness)));

  world.cars = cars;
  world.bestCar = bestCar;

  viewport.offset.x = -bestCar.x;
  viewport.offset.y = -bestCar.y;

  viewport.reset();
  const viewPoint = scale(viewport.getOffset(), -1);
  world.draw(carCTX, viewPoint, false);
  miniMap.update(viewPoint);

  for (let i = 0; i < traffic.length; i++) {
    traffic[i].draw(carCTX, "red");
  }

  networkCTX.lineDashOffset = -time / 50;
  networkCTX.clearRect(0, 0, networkCanvas.width, networkCanvas.height);
  Visualizer.drawNetwork(networkCTX, bestCar.brain);
  requestAnimationFrame(animate);
}

function generateCars(N) {
  const startPoints = world.markings.filter((m) => m instanceof Start);
  const startPoint = startPoints.length > 0 ? startPoints[0].center : new Point(100, 100);
  const dir = startPoints.length > 0 ? startPoints[0].directionVector : new Point(0, -1);
  const startAngle = -angle(dir) + Math.PI / 2;

  const cars = [];

  for (let i = 0; i < N; i++) {
    cars.push(new Car(startPoint.x, startPoint.y, 30, 50, "AI", startAngle));
  }

  return cars;
}

function saveBestBrain() {
  localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

function saveBestBrainJSON() {
  const a = document.createElement("a");
  const data = JSON.stringify(bestCar.brain, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  a.href = URL.createObjectURL(blob);
  a.setAttribute("download", "brain.json");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function loadBrain(event) {
  const file = event.target.files[0];
  if (!file) {
    alert("No file selected");
    return;
  }

  const reader = new FileReader();
  reader.readAsText(file);

  reader.onload = (e) => {
    const content = e.target.result;
    const brain = JSON.parse(content);
    localStorage.setItem("bestBrain", JSON.stringify(brain));
    location.reload();
  };
}

function loadWorld(event) {
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

function discardBestBrain() {
  localStorage.removeItem("bestBrain");
}

function getBestBrain() {
  if (localStorage.getItem("bestBrain")) {
    for (let i = 0; i < cars.length; i++) {
      cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));

      if (i != 0) {
        NeuralNetwork.mutate(cars[i].brain, 0.95);
      }
    }
  }
}
