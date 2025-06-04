import createPanZoom, { PanZoom } from "panzoom";
import { Accessor, createEffect, createRenderEffect, createSignal, onCleanup, onMount, useContext } from "solid-js";
import { listenToMouseClick, MouseEventWithDrag } from "../../../lib/mouse";
import { Grid, rectangle } from "honeycomb-grid";
import HexTile from "../../../models/HexTile";
import { SVG } from "@svgdotjs/svg.js";
import { HexGridContext } from "./context";

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      hexGrid: HexGridOptions
    }
  }
}

type HexGridOptions = {
  /** defaults to `5` */
  // stepDeg?: number;
  enable: boolean;
  onClick?: (hex: HexTile) => void
};


const HEX_HORIZONTAL_RATIO = 4 / 3; // ratio of hexagon width to quantity of hexagons, when on a grid
const DEFAULT_TILE_COST_WEEKS = 1;

export default function hexGrid(elRef: HTMLElement, options: Accessor<HexGridOptions>) {
  const context = useContext(HexGridContext)

  // let grid: Grid<SvgHex>;
  let removeMouseClickListener: ReturnType<typeof listenToMouseClick>;

  function onHexClick({ offsetX, offsetY, isDrag }: MouseEventWithDrag) {
    const hex = context!.grid()!.pointToHex(
      { x: offsetX, y: offsetY },
      { allowOutside: false }
    )
    if (!hex) return;

    if (!isDrag) {
      // TODO: toggle when on select mode
      hex.toggleSelect();
      options().onClick?.(hex);
    }
  }

  createRenderEffect(() => {
    if (!options().enable) return;
    if (!context) throw new Error("use:hexGrid must be used inside a HexGridProvider")

    const parentBox = elRef.parentElement!.getBoundingClientRect();

    const tile = new HexTile();
    const howManyPixelsPerTile = {
      x: tile.width / HEX_HORIZONTAL_RATIO,
      y: tile.height
    };

    const cols = Math.round((parentBox.width) / howManyPixelsPerTile.x);
    const rows = Math.round(parentBox.height / howManyPixelsPerTile.y);

    const grid = new Grid(HexTile, rectangle({ width: cols, height: rows }));
    const svgCanvas = SVG().addTo(elRef).size('100%', '100%');

    grid.forEach((hex) => {
      hex.renderSVG(svgCanvas);
      hex.cost = DEFAULT_TILE_COST_WEEKS;
    });

    context.setGrid(grid)
    removeMouseClickListener = listenToMouseClick(elRef, onHexClick);
  });

  onCleanup(() => removeMouseClickListener?.())

}
