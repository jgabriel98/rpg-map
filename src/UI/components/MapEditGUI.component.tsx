import { type Component } from 'solid-js';

interface MapEditGUIProps {
  tileRadius: number;
  onSetTileRadius: (v: number) => void;
  tileCost: number;
  onSetTileCost: (v: number) => void;

}

const MapEditGUI: Component<MapEditGUIProps> = (props) => {
  return <>
    <div>
      <span>Tamanho do bloco: </span>
      <span>{props.tileRadius} </span>

      <button on:click={() => props.onSetTileRadius(props.tileRadius + 1)}>+</button>
      <button on:click={() => props.onSetTileRadius(Math.max(props.tileRadius - 1, 0))}>-</button>
    </div>

    <div>
      <span>Custo de movimento por bloco: </span>
      <span>{props.tileCost} </span>

      <button on:click={() => props.onSetTileCost(props.tileCost + 1)}>+</button>
      <button on:click={() => props.onSetTileCost(Math.max(props.tileCost - 1, 0))}>-</button>

    </div>
  </>;
};

export default MapEditGUI;