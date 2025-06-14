import { createAsync, useParams } from '@solidjs/router';
import { batch, createComputed, createSignal, ErrorBoundary, Show, type Component } from 'solid-js';

import { fetchMap } from '~/services/map';
import { HexMap } from '~/UI/components/HexMap.component';
import { HexGridProvider } from '~/UI/directives';
import { LoadingSpinner } from '../components/loading/LoadingSpinner.component';
import MapEditGUI from '../components/MapEditGUI.component';

type EditMapRouteParams = {
  id: string;
};

const EditMap: Component = () => {
  const { id } = useParams<EditMapRouteParams>();
  const mapQuery = createAsync(() => fetchMap(id));

  const [backgroundUrl, setBackgroundUrl] = createSignal<string>();
  const [tileRadius, setTileRadius] = createSignal<number>();
  const [tileCost, setTileCost] = createSignal<number>();

  createComputed(() => {
    const data = mapQuery()?.data;
    if (!data) return;

    batch(() => {
      setBackgroundUrl(data.background_url);
      setTileRadius(data.hex_tile_radius);
      setTileCost(data.tile_cost);
    });
  });

  return (
    <HexGridProvider>
      <ErrorBoundary fallback="something when wrong">
        <Show when={backgroundUrl()} fallback={<LoadingSpinner />}>
          <div class='z-10 absolute flex flex-col'>
            <MapEditGUI tileCost={tileCost()!} tileRadius={tileRadius()!} onSetTileCost={setTileCost} onSetTileRadius={setTileRadius} />
          </div>
          <HexMap backgroundSrc={backgroundUrl()!} tileRadius={tileRadius()!} tileCost={tileCost()!} />
        </Show>
      </ErrorBoundary>
    </HexGridProvider>
  );
};



export default EditMap;
