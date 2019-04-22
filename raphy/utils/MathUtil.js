class MathUtil {
  static angle(p1, p2, p3) {
    if (p3) {
      return Math.abs(this.angle(p1, p3) - this.angle(p2, p3));
    }

    let angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    while (angle < 0) {
      angle += 2 * Math.PI;
    }

    return angle;
  }

  static rad(degree) {
    return degree * Math.PI / 180;
  }

  static deg(radians) {
    return radians * 180 / Math.PI;
  }

  static movePoint(point, targetPoint, distance) {
    const radians = this.angle(point, targetPoint);
    // const degree = this.deg(radians);
    const offsetPoint = this.offset(point, Math.cos(radians) * distance, -Math.sin(radians) * distance);
    return offsetPoint;
  }

  static offset(point, dx, dy) {
    point.x += dx;
    point.y += dy;

    return point;
  }

  static lerp(a, b, x) {
    return a + x * (b - a);
  }

  static midPoint(p1, p2, t = 0.5) {
    return {
      x: this.lerp(p1.x, p2.x, t),
      y: this.lerp(p1.y, p2.y, t),
    };
  }
}

export default MathUtil;
