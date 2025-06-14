import { Component, createEffect, createSignal, Show } from "solid-js";
// import { ReactiveSet, ReactiveWeakSet } from "@solid-primitives/set";

import { panZoom } from "../directives";
import { HexGrid } from "./HexGrid.component";
import styles from './HexMap.module.css';

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
panZoom;// Preserve the import.


interface MapContentProps {
  backgroundSrc: string;
  tileRadius: number;
  tileCost: number;
}

export const HexMap: Component<MapContentProps> = (props) => {
  let backgroundImage: HTMLImageElement;
  const [backgroundReady, setBackgroundReady] = createSignal(false);

  console.log(props);

  createEffect(() => {
    backgroundImage!.style.display = 'none';
  });

  const onBackgroundLoad = () => {
    backgroundImage!.style.display = 'block';
    setBackgroundReady(true);
  };

  return <>
    <div class={styles.container} use:panZoom={{ enable: backgroundReady() }}>
      <img ref={backgroundImage!} class={styles.background} on:load={onBackgroundLoad} src={props.backgroundSrc} alt="Map Background" />
      <Show when={backgroundReady()}>
        <HexGrid tileRadius={props.tileRadius} costPerTile={props.tileCost} />
      </Show>
    </div>
  </>;
};
