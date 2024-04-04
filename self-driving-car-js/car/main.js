carCanvas.width = window.innerWidth - 330;
networkCanvas.width = 300;

carCanvas.height = window.innerHeight;
networkCanvas.height = window.innerHeight;

const carCTX = carCanvas.getContext("2d");
const networkCTX = networkCanvas.getContext("2d");

const worldStorage = localStorage.getItem("world");
const worldData = worldStorage ? JSON.parse(worldStorage) : null;
const world = worldData ? World.load(worldData) : new World(new Graph());
const viewport = new Viewport(carCanvas, world.zoom, world.offset);

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
