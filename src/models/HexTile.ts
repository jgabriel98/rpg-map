import { Element, FillData, G, Image, Polygon } from "@svgdotjs/svg.js";
import { ArrayXY } from "@svgdotjs/svg.js";
import { Svg } from "@svgdotjs/svg.js";
import { defineHex, Orientation } from "honeycomb-grid"

import "./HexTile.css"

const HEX_RADIUS = 25; // radius of the hexagon

type RenderSVGOptions = {
  fill?: FillData | string | Element | Image
}

export default class HexTile extends defineHex({
  /** hex diagonal radius. */
  dimensions: HEX_RADIUS,
  origin: 'topLeft',
  orientation: Orientation.FLAT
}) {
  private _svgGroup?: G;
  private _svgPolygon?: Polygon

  private _selected: boolean = false;
  /** pathfinding cost */
  public cost!: number

  get svgGroup(): G {
    if (!this._svgGroup) throw new Error("SVG element not rendered yet. Call renderSVG first.");
    return this._svgGroup;
  }

  get svgPolygon(): Polygon {
    if (!this._svgPolygon) throw new Error("SVG element not rendered yet. Call renderSVG first.");
    return this._svgPolygon;
  }

  get selected() { return this._selected; }

  toggleSelect() {
    if (!this._svgGroup) throw new Error("SVG element not rendered yet. Call renderSVG first.");
    this._selected = !this._selected;
    this._svgGroup.toggleClass('selectedHex');
  }

  public renderSVG(svgCanvas: Svg, options: RenderSVGOptions = {}) {
    this._svgGroup?.remove();

    const polygon: Polygon =
      svgCanvas
        // create a polygon from a hex's corner points
        .polygon(this.corners.map(({ x, y }) => [x, y] as ArrayXY))
        // @ts-ignore
        .fill(options.fill ?? 'none')
        .stroke({ width: 2, color: 'black', opacity: 0.075, linejoin: 'round' });
    
    this._svgPolygon = polygon;
    this._svgGroup = svgCanvas.group().add(polygon);
  }

}