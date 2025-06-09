import { createAsync, query, useParams } from '@solidjs/router';
import { Match, Show, Switch } from 'solid-js';
import { Suspense, type Component } from 'solid-js';
import { buckets, supabase } from '~/lib/supabase';
import { HexMap } from '~/UI/components/HexMap.component';
import { HexGridProvider } from '~/UI/directives';
import Loading from '../components/Loading.component';

type MapRouteParams = {
  id: string
}

const Map: Component = () => {
  const { id } = useParams<MapRouteParams>();
  const mapsQuery = createAsync(() => getMapConfigs(id));

  const backgroundUrl = () => mapsQuery()?.data?.background_url;
  const tileRadius = () => mapsQuery()?.data?.hex_tile_radius;


  return (
    <HexGridProvider>
      <Suspense fallback={<Loading />}>
        <Switch>
          <Match when={mapsQuery()?.data}>
            <HexMap backgroundSrc={backgroundUrl()!} tileRadius={tileRadius()!} />
          </Match>

          <Match when={backgroundUrl() == null}>
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
