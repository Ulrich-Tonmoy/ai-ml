class Building {
  constructor(poly, heightCoefficient = 0.4) {
    this.base = poly;
    this.heightCoefficient = heightCoefficient;
  }

  draw(ctx, viewPoint) {
    const top = this.base.points.map((p) =>
      add(p, scale(subtract(p, viewPoint), this.heightCoefficient)),
    );
    const ceiling = new Polygon(top);

    const sides = [];
    for (let i = 0; i < this.base.points.length; i++) {
      const next = (i + 1) % this.base.points.length;
      const poly = new Polygon([
        this.base.points[i],
        this.base.points[next],
        top[next],
        top[i],
      ]);
      sides.push(poly);
    }

    sides.sort((a, b) => b.distanceToPoint(viewPoint) - a.distanceToPoint(viewPoint));

    this.base.draw(ctx, { fill: "white", stroke: "wheat" });
    for (const side of sides) {
      side.draw(ctx, { fill: "white", stroke: "wheat" });
    }
    ceiling.draw(ctx, { fill: "white", stroke: "wheat" });
  }
}
