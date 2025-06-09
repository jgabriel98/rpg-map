import { Component, createEffect, createMemo, createRenderEffect, createSignal, onCleanup, onMount, Show, useContext } from "solid-js";
// import { ReactiveSet, ReactiveWeakSet } from "@solid-primitives/set";

import { panZoom, useHexGrid } from "../directives";
import styles from './HexMap.module.css';
import { listenToMouseClick, MouseEventWithDrag } from "~/lib/mouse";
import { defineHexTile } from "~/models/HexTile.model";
import { HexGridContext } from "~/contexts/HexGrid.context";
import { rectangle } from "honeycomb-grid";
import HexGridModel from "~/models/HexGrid.model";


panZoom;// Preserve the import.


interface HexGridProps {
  tileRadius: number;
  costPerTile: number;
}

const HEX_HORIZONTAL_RATIO = 4 / 3; // ratio of hexagon width to quantity of hexagons, when on a grid

export const HexGrid: Component<HexGridProps> = (props) => {
  let elRef!: HTMLDivElement;
  const context = useContext(HexGridContext)
  const CustomHexTileClass = createMemo(() => defineHexTile({ dimensions: props.tileRadius, cost: props.costPerTile }))

  function onHexClick({ offsetX, offsetY, isDrag }: MouseEventWithDrag) {
    const hex = context!.grid()!.pointToHex({ x: offsetX, y: offsetY }, { allowOutside: false })
    if (!hex) return;

    if (!isDrag) {
      const shouldUnselect = hex.selected;
      context?.selectTile(hex, shouldUnselect)
    }
  }

  createEffect(() => { 
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
    const grid = new HexGridModel(CustomHexTile, rectangle({ width: cols, height: rows }));

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

  return <div ref={elRef} class={styles.hexGrid}  />
}
