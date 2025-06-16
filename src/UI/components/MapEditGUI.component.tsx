import { createSignal, type Component } from 'solid-js';
import { Button } from '~/lib/solidui/button';
import { LoadingSpinner } from './loading/LoadingSpinner.component';

interface MapEditGUIProps {
  tileRadius: number;
  onSetTileRadius: (v: number) => void;
  tileCost: number;
  onSetTileCost: (v: number) => void;
  onSubmit: () => Promise<void>;
}

const MapEditGUI: Component<MapEditGUIProps> = (props) => {
  const [isLoading, setIsLoading] = createSignal(false);
  const handleSubmit = async () => {
    setIsLoading(true);
    await props.onSubmit();
    setIsLoading(false);
  };

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

    <Button onClick={handleSubmit} disabled={isLoading()}>
      {isLoading() ? <LoadingSpinner /> : "Salvar"}
    </Button>
  </>;
};

export default MapEditGUI;