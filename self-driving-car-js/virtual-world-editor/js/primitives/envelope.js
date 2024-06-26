class Envelope {
  constructor(skeleton, width, borderRadius = 1) {
    if (skeleton) {
      this.skeleton = skeleton;
      this.poly = this.#generatePolygon(width, borderRadius);
    }
  }

  static load(data) {
    const env = new Envelope();
    env.skeleton = new Segment(data.skeleton.p1, data.skeleton.p2);
    env.poly = Polygon.load(data.poly);
    return env;
  }

  #generatePolygon(width, borderRadius) {
    const { p1, p2 } = this.skeleton;
    const radius = width / 2;
    const alpha = angle(subtract(p1, p2));
    const alpha_cw = alpha + Math.PI / 2;
    const alpha_ccw = alpha - Math.PI / 2;

    const points = [];
    const step = Math.PI / Math.max(1, borderRadius);
    const eps = step / 2;
    for (let i = alpha_ccw; i <= alpha_cw + eps; i += step) {
      points.push(translate(p1, i, radius));
    }
    for (let i = alpha_ccw; i <= alpha_cw + eps; i += step) {
      points.push(translate(p2, Math.PI + i, radius));
    }

    return new Polygon(points);
  }

  draw(ctx, options) {
    this.poly.draw(ctx, options);
  }
}
