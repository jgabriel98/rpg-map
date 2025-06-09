import { rectangle } from "honeycomb-grid";
import { Accessor, createMemo, createRenderEffect, onCleanup, onMount, useContext } from "solid-js";
import { listenToMouseClick, MouseEventWithDrag } from "~/lib/mouse";
import HexGrid from "~/models/HexGrid";
import { defineHexTile, HexTile } from "~/models/HexTile";
import { HexGridContext } from "./context";

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      hexGrid: HexGridOptions
    }
  }
}

type HexGridOptions = {
  enable: boolean;
  tileRadius: number;
  /** defaults to 1 */
  costPerTile?: number;
  onClick?: (hex: HexTile) => void
};


const HEX_HORIZONTAL_RATIO = 4 / 3; // ratio of hexagon width to quantity of hexagons, when on a grid

export default function hexGrid(elRef: HTMLElement, options: Accessor<HexGridOptions>) {
  const context = useContext(HexGridContext)
  const CustomHexTileClass = createMemo(() => defineHexTile({ dimensions: options().tileRadius, cost: options().costPerTile }))

  function onHexClick({ offsetX, offsetY, isDrag }: MouseEventWithDrag) {
    const hex = context!.grid()!.pointToHex({ x: offsetX, y: offsetY }, { allowOutside: false })
    if (!hex) return;

    if (!isDrag) {
      const shouldUnselect = hex.selected;
      context?.selectTile(hex, shouldUnselect)
      options().onClick?.(hex);
    }
  }

  createRenderEffect(() => {
    if (!options().enable) return;
    if (!context) throw new Error("use:hexGrid must be used inside a HexGridProvider");
    const CustomHexTile = CustomHexTileClass()

    // const parentBox = elRef.parentElement!.getBoundingClientRect();
    const parentBox = {
      width: parseInt(getComputedStyle(elRef.parentElement!).width),
      height: parseInt(getComputedStyle(elRef.parentElement!).height)
    }

    const tile = new CustomHexTile();
    const howManyPixelsPerTile = {
      x: tile.width / HEX_HORIZONTAL_RATIO,
      y: tile.height
    };

    const cols = Math.round((parentBox.width) / howManyPixelsPerTile.x);
    const rows = Math.round(parentBox.height / howManyPixelsPerTile.y);
    const grid = new HexGrid(CustomHexTile, rectangle({ width: cols, height: rows }));

    context.setGrid(prev => {
      prev?.clearRender?.();
      grid.setRenderMount(elRef);
      grid.render();
      return grid;
    })
  });

  let removeMouseClickListener: ReturnType<typeof listenToMouseClick>;
  onMount(() => { removeMouseClickListener = listenToMouseClick(elRef, onHexClick) })
  onCleanup(() => { removeMouseClickListener() })
}
