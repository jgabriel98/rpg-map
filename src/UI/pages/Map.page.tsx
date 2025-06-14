import { createAsync, useParams } from '@solidjs/router';
import { Match, Suspense, Switch, type Component } from 'solid-js';
import { fetchMap } from '~/services/map';
import { HexMap } from '~/UI/components/HexMap.component';
import { HexGridProvider } from '~/UI/directives';
import { LoadingSpinner } from '../components/loading/LoadingSpinner.component';

type MapRouteParams = {
  id: string;
};

const Map: Component = () => {
  const { id } = useParams<MapRouteParams>();
  const mapsQuery = createAsync(() => fetchMap(id));

  const mapConfig = () => mapsQuery()?.data;

  return (
    <HexGridProvider>
      <Suspense fallback={<LoadingSpinner />}>
        <Switch>
          <Match when={mapConfig()}>
            <HexMap backgroundSrc={mapConfig()!.background_url} tileRadius={mapConfig()!.hex_tile_radius} tileCost={mapConfig()!.tile_cost} />
          </Match>

          <Match when={!mapConfig()}>
            Mapa não encontrado!
          </Match>

          <Match when={mapsQuery()?.error}>
            Mapa não encontrado!
          </Match>
        </Switch>
      </Suspense>
    </HexGridProvider>
  );
};

export default Map;
