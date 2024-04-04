class Marking {
  constructor(center, directionVector, width, height) {
    this.center = center;
    this.directionVector = directionVector;
    this.width = width;
    this.height = height;

    this.support = new Segment(
      translate(center, angle(directionVector), height / 2),
      translate(center, angle(directionVector), -height / 2),
    );
    this.poly = new Envelope(this.support, width, 0).poly;
    this.type = "marking";
  }

  static load(data) {
    const point = new Point(data.center.x, data.center.y);
    const dirVec = new Point(data.directionVector.x, data.directionVector.y);
    switch (data.type) {
      case "crossing":
        return new Crossing(point, dirVec, data.width, data.height);
      case "light":
        return new Light(point, dirVec, data.width, data.height);
      case "marking":
        return new Marking(point, dirVec, data.width, data.height);
      case "parking":
        return new Parking(point, dirVec, data.width, data.height);
      case "start":
        return new Start(point, dirVec, data.width, data.height);
      case "stop":
        return new Stop(point, dirVec, data.width, data.height);
      case "target":
        return new Target(point, dirVec, data.width, data.height);
      case "yield":
        return new Yield(point, dirVec, data.width, data.height);

      default:
        break;
    }
  }

  draw(ctx) {
    this.poly.draw(ctx);
  }
}
