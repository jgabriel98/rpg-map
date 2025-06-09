import { Component, createEffect, createSignal, Show } from "solid-js";
// import { ReactiveSet, ReactiveWeakSet } from "@solid-primitives/set";

import { hexGrid, panZoom, useHexGrid } from "../directives";
import styles from './HexMap.module.css';
import { HexTile } from "~/models/HexTile.model";

panZoom; hexGrid;// Preserve the import.


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

interface MapContentProps {
  backgroundSrc: string;
  tileRadius: number;
}

export const HexMap: Component<MapContentProps> = (props) => {
  let backgroundImage: HTMLImageElement;
  const [backgroundReady, setBackgroundReady] = createSignal(false);

  createEffect(() => {
    backgroundImage!.style.display = 'none'
  })

  const onBackgroundLoad = () => {
    backgroundImage!.style.display = 'block'
    setBackgroundReady(true)
  }

  return <>
    {/* <Gui clearPath={() => clearPath(previousPath)} /> */}
    <div class={styles.container} use:panZoom={{ enable: backgroundReady() }}>
      <img ref={backgroundImage!} class={styles.background} on:load={onBackgroundLoad} src={props.backgroundSrc} alt="Map Background" />
      <div class={styles.hexGrid} use:hexGrid={{ enable: backgroundReady(), tileRadius: props.tileRadius, costPerTile: 1 }} />
    </div>
  </>
}
