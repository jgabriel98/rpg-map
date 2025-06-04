import { Component, createRenderEffect, createEffect, createSignal, onMount, onCleanup } from "solid-js";
import { ReactiveSet, ReactiveWeakSet } from "@solid-primitives/set";

import styles from './Map.module.css';
import mapBackground from "./Umbrasil_upscaled.webp";
import HexTile from "../../models/HexTile";

// @ts-ignore
import { HexGridProvider, hexGrid, useHexGrid, panZoom } from "../directives";


class MapArea {
  private topLevelHexes = [];

  constructor(topLevelHexes: []) {
    this.topLevelHexes = topLevelHexes;
    // this.topLevelHexes.forEach(hexTile => {
    //   hexTile.
    // })
  }
}

interface GuiProps {
  clearPath: () => void
}

const Gui: Component<GuiProps> = ({ clearPath }) => {
  return <button class={styles.floatingUi} on:click={clearPath}>Limpar caminho(rota)</button>
}

export const Map: Component = () => {
  const [containerRef, setContainerRef] = createSignal<HTMLDivElement>();
  // const [popperRef, setPopperRef] = createSignal<HTMLDivElement>();
  let backgroundImage: HTMLImageElement;
  let previousPath: Array<HexTile>;

  // const selectedTiles = new ReactiveSet<SvgHex>();
  const [selectedTiles, setSelectedTiles] = createSignal<HexTile[]>([]);
  const [backgroundReady, setBackgroundReady] = createSignal(false);
  const { createPath, clearPath } = useHexGrid();

  const onClickHexTile = (hex: HexTile) => {
    let newArray = [...selectedTiles()];
    if (hex.selected) {
      newArray.push(hex)
    } else {
      const isPathEdge = previousPath[0] === hex || previousPath[previousPath.length - 1] === hex;
      if (isPathEdge) clearPath(previousPath);
      newArray.splice(newArray.findIndex(v => v === hex), 1)
    }

    if (newArray.length === 2) {
      if (previousPath) clearPath(previousPath);
      previousPath = createPath(newArray[0], newArray[1]);
    }

    setSelectedTiles(newArray);
  }

  createEffect(() => {
    backgroundImage!.style.display = 'none'
  })

  const onBackgroundLoad = () => {
    backgroundImage!.style.display = 'block'
    setBackgroundReady(true)
  }

  return <>
    <Gui clearPath={() => clearPath(previousPath)} />
    <div ref={setContainerRef} class={styles.container} use:panZoom={{ enable: backgroundReady() }}>
      <img ref={backgroundImage!} class={styles.background} on:load={onBackgroundLoad} src={mapBackground} alt="Map Background" />
      <div class={styles.hexGrid} use:hexGrid={{ enable: backgroundReady(), onClick: onClickHexTile }} />
    </div>
  </>
}
