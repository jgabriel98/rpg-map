import { Element, FillData, G, Image, Polygon } from "@svgdotjs/svg.js";
import { ArrayXY } from "@svgdotjs/svg.js";
import { Svg } from "@svgdotjs/svg.js";
import { BoundingBox, createHexDimensions, createHexOrigin, defaultHexSettings, defineHex, Ellipse, Hex, HexCoordinates, HexOffset, HexOptions, Orientation, Point } from "honeycomb-grid"

import "./HexTile.css"

type RenderSVGOptions = {
  fill?: FillData | string | Element | Image
}

class HexTile extends Hex {
  private _svgGroup?: G;
  private _svgPolygon?: Polygon

  private _selected: boolean = false;
  /** pathfinding cost */
  public cost: number = 1;

  get svgGroup(): G {
    if (!this._svgGroup) throw new Error("SVG element not rendered yet. Call renderSVG first.");
    return this._svgGroup;
  }

  get svgPolygon(): Polygon {
    if (!this._svgPolygon) throw new Error("SVG element not rendered yet. Call renderSVG first.");
    return this._svgPolygon;
  }

  get selected() { return this._selected; }
  set selected(value: boolean) {
    if (!this._svgGroup) throw new Error("SVG element not rendered yet. Call renderSVG first.");
    this._selected = value;
    if (value) this._svgGroup.addClass('selectedHex');
    else this._svgGroup.removeClass('selectedHex');
  }

  // toggleSelect() {
    // if (!this._svgGroup) throw new Error("SVG element not rendered yet. Call renderSVG first.");
    // this._selected = !this._selected;
    // this._svgGroup.toggleClass('selectedHex');
  // }

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

export type { HexTile };

type HexTileOptions = HexOptions & {
  cost: number
}

const defaultHexTileSettings = {
  ...defaultHexSettings,
  cost: 1,
  orientation: Orientation.FLAT
} as const;



export function defineHexTile(hexTileOptions?: Partial<HexTileOptions>): typeof HexTile {
  const options = { ...defaultHexTileSettings, ...hexTileOptions };
  const { dimensions, orientation, origin, offset } = options;

  return class extends HexTile {
    public cost = options.cost

    get dimensions(): Ellipse {
      return createHexDimensions(dimensions as BoundingBox, orientation)
    }

    get orientation(): Orientation {
      return orientation
    }

    get origin(): Point {
      return createHexOrigin(origin as 'topLeft', this)
    }

    get offset(): HexOffset {
      return offset
    }
  }
}