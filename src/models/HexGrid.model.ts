import { Grid } from "honeycomb-grid";
import { Svg, SVG } from "@svgdotjs/svg.js";
import { HexTile } from "./HexTile.model";
import { createShortestPath_AStar, paintTraversablePath, unpaintTraversablePath } from "~/lib/utils/hexgrid.helpers";


class HexGrid<T extends HexTile = HexTile> extends Grid<T> {
  private mountRef?: HTMLElement
  private svgCanvas?: Svg

  setRenderMount(ref: HTMLElement) {
    this.mountRef = ref;
  }

  render() {
    if (!this.mountRef) throw new Error("cannot render without setting renderMount ref");
    if (this.svgCanvas) this.clearRender();

    const svgCanvas = SVG().addTo(this.mountRef).size('100%', '100%');
    this.svgCanvas = svgCanvas;

    this.forEach((hex) => {
      hex.renderSVG(svgCanvas);
    });
  }

  clearRender() {
    this.svgCanvas?.remove();
    this.svgCanvas = undefined;
  }

  createPath(start: T, goal: T)  {
    const shortestPath = createShortestPath_AStar(this, start, goal);

    if (!shortestPath) throw new Error("there's no possible path")
    return paintTraversablePath(this, shortestPath)
  }

  clearPath(path: Iterable<T>) {
    unpaintTraversablePath(path);
  }
}


export default HexGrid;