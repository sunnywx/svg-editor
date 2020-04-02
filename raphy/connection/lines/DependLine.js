import BezierLine from './BezierCurveLine';

export default class DependLine extends BezierLine {
  setMarker(line = this.line) {
    // const icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAEKADAAQAAAABAAAAEAAAAAA0VXHyAAABAUlEQVQ4EdWSvY4BYRSGZ5D4S2xsNiFbiCjUolklEdlGRMcVuI69DpXGJWglKoWGaNQq4QKQsON5JTMxfCIq8SZPzvlOznvmfDNjWW8v+9ENHMeJ0fMDn7CBiW3bW+JZATcxRcwJ6k1IwwqyUAFPIS+7SjBHKNVhBwOeuqe2Jq8QwzqTW8YNZKZBxjnI9AtSEg5w1EG62QCz1q4TZdb9ezDkvCAWYMxwDTnLtwFNcaru2h/kfRjBH5RhilmDzWJAFdoQhgZ04VvdxIzZdVGlqQUlt0Sehw7cNV+/A33nHAZ9si8ogtZeEo3y/UgY9dJqkIJ/0E8zIz4nBkUh+JzrVd0naO1xTPl3ImYAAAAASUVORK5CYII=';
    line.marker('end', 20, 20, add => {
      // add.image(icon).size(10, 10).dmove(0, 5);
      add.circle(10)
        .center(0, 0)
        .dmove(5, 10)
        .fill(this.options.stroke);
    });

    this.arrow = line.reference('marker-end');
  }
}
