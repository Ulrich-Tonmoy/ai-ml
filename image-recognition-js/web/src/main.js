let index = 0;
const labels = ["car", "fish", "house", "tree", "bicycle", "guitar", "pencil", "clock"];
const data = {
  playerName: null,
  session: crypto.randomUUID(),
  drawings: {},
};
const sketchPad = new SketchPad(sketchPadContainer);

function start() {
  if (playerName.value === "") {
    alert("Please enter your name first!");
    return;
  }
  data.playerName = playerName.value;
  playerName.style.display = "none";

  sketchPadContainer.style.visibility = "visible";
  const label = labels[index];
  instructions.innerHTML = `Please draw a ${label}`;
  advanceBtn.innerHTML = "Next";
  advanceBtn.onclick = next;
}

function next() {
  if (sketchPad.paths.length == 0) {
    alert("Draw something first!");
    return;
  }
  const label = labels[index];
  data.drawings[label] = sketchPad.paths;
  sketchPad.reset();
  index++;
  if (index < labels.length) {
    const nextLabel = labels[index];
    instructions.innerHTML = `Please draw a ${nextLabel}`;
  } else {
    sketchPadContainer.style.visibility = "hidden";
    instructions.innerHTML = "Thank you!";
    advanceBtn.innerHTML = "Save";
    advanceBtn.onclick = save;
  }
}

function save() {
  advanceBtn.style.display = "none";
  instructions.innerHTML =
    "Take your downloaded file and place it alongside the others in the dataset!";

  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(JSON.stringify(data))
  );
  const fileName = data.session + ".json";
  element.setAttribute("download", fileName);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
