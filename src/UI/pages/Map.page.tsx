import { createAsync, query, useParams } from '@solidjs/router';
import { Match, Show, Switch } from 'solid-js';
import { Suspense, type Component } from 'solid-js';
import { buckets, supabase } from '~/lib/supabase';
import { HexMap } from '~/UI/components/HexMap.component';
import { HexGridProvider } from '~/UI/directives';
import { LoadingSpinner } from '../components/loading/LoadingSpinner.component';

type MapRouteParams = {
  id: string
}

const Map: Component = () => {
  const { id } = useParams<MapRouteParams>();
  const mapsQuery = createAsync(() => getMapConfigs(id));

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


const getMapConfigs = query(async (id: string) => {
  const { data, error } = await supabase.from('maps').select().eq('id', parseInt(id)).single();

  if(data?.background_url)
    data.background_url = buckets.mapsAssets.getPublicUrl(data.background_url).data.publicUrl

  return { data, error };
}, `map`)


export default Map;
