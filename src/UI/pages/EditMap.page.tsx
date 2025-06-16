import { createAsync, useParams } from '@solidjs/router';
import { ErrorBoundary, Suspense, type Component } from 'solid-js';

import { createAsyncSignal } from '~/lib/solidjs-helpers';
import { fetchMap, updateMap } from '~/services/map.service';
import { HexMap } from '~/UI/components/HexMap.component';
import { HexGridProvider } from '~/UI/directives';
import { LoadingSpinner } from '../components/loading/LoadingSpinner.component';
import MapEditGUI from '../components/MapEditGUI.component';
import { createSignal } from 'solid-js';
import { Button } from '~/lib/solidui/button';

type EditMapRouteParams = {
  id: string;
};

const EditMap: Component = () => {
  const { id } = useParams<EditMapRouteParams>();
  const mapQuery = createAsync(() => fetchMap(id));

  const [backgroundUrl,] = createAsyncSignal(() => mapQuery()?.data?.background_url);
  const [tileRadius, setTileRadius] = createAsyncSignal(() => mapQuery()?.data?.hex_tile_radius);
  const [tileCost, setTileCost] = createAsyncSignal(() => mapQuery()?.data?.tile_cost);

  const [isLoading, setIsLoading] = createSignal(false);

  const onSubmit = async () => {
    setIsLoading(true);
    await updateMap(id, {
      hex_tile_radius: tileRadius(),
      tile_cost: tileCost()
    });
    setIsLoading(false);
  };

  return (
    <HexGridProvider>
      <ErrorBoundary fallback="something when wrong">
        <Suspense fallback={<LoadingSpinner />}>
          <div class='z-10 absolute flex flex-col'>
            <MapEditGUI
              tileCost={tileCost()!}
              tileRadius={tileRadius()!}
              onSetTileCost={setTileCost}
              onSetTileRadius={setTileRadius}
            />
            <Button onClick={onSubmit} disabled={isLoading()} class='self-center mt-3'>
              {isLoading() ? <LoadingSpinner /> : "Salvar"}
            </Button>
          </div>
          <HexMap backgroundSrc={backgroundUrl()!} tileRadius={tileRadius()!} tileCost={tileCost()!} />
        </Suspense>
      </ErrorBoundary>
    </HexGridProvider>
  );
};



export default EditMap;
