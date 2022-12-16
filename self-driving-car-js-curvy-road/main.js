carCanvas.height = window.innerHeight;
carCanvas.width = 200;

networkCanvas.height = window.innerHeight;
networkCanvas.width = 300;

const carCTX = carCanvas.getContext("2d");
const networkCTX = networkCanvas.getContext("2d");

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.95);

const aiCarNumbers = 250;
const cars = generateCars(aiCarNumbers);
let bestCar = cars[0];
getBestBrain();

const traffic = [
    new Car(road.getLaneCenter(1), -300, 30, 50, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(0), -100, 30, 50, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(2), -300, 30, 50, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(3), -100, 30, 50, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(1), -500, 30, 50, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(0), -500, 30, 50, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(2), -700, 30, 50, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(3), -700, 30, 50, "DUMMY", 2, getRandomColor()),
];

animate();
function animate(time) {
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].update([], []);
    }

    for (let i = 0; i < cars.length; i++) {
        cars[i].update(road.borders, traffic);
    }

    bestCar = cars.find((c) => c.y == Math.min(...cars.map((c) => c.y)));

    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    carCTX.save();
    carCTX.translate(0, -bestCar.y + carCanvas.height * 0.8);

    road.draw(carCTX);

    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(carCTX, "red");
    }

    carCTX.globalAlpha = 0.2;
    for (let i = 0; i < cars.length; i++) {
        cars[i].draw(carCTX, "green");
    }
    carCTX.globalAlpha = 1;
    bestCar.draw(carCTX, "green", true);

    carCTX.restore();

    networkCTX.lineDashOffset = -time / 50;
    Visualizer.drawNetwork(networkCTX, bestCar.brain);
    requestAnimationFrame(animate);
}

function generateCars(N) {
    const cars = [];

    for (let i = 0; i < N; i++) {
        cars.push(new Car(100, 100, 30, 50, "AI"));
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

            if (i > 0) {
                NeuralNetwork.mutate(cars[i].brain, 0.1);
            }
        }
    }
}
