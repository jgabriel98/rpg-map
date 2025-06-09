import { A, createAsync, query, useNavigate } from '@solidjs/router';
import { For, type Component } from 'solid-js';
import { buckets, supabase } from '~/lib/supabase';
import { Tables } from '~/lib/supabase/database.types';

const Fallback: Component<{ isLoading: boolean }> = (props) => props.isLoading ? <div>Loading maps...</div> : <div>No maps available.</div>;

const MapPreview: Component<{ map: Tables<'maps'> }> = ({ map }) => {
  const navigate = useNavigate()
  return (
    <div on:click={() => navigate(`/maps/${map.id}`)}>
      <h2>Map ID: {map.id}</h2>
      <p>Created at: {new Date(map.created_at).toLocaleString()}</p>
      <img src={map.background_url!} alt={`Map ${map.id}`}  />
    </div>
  );
}


const getMaps = query(async () => {
  let { data, count, error } = await supabase.from("maps").select()

  data?.forEach(map => {
    map.background_url = buckets.mapsAssets.getPublicUrl(map.background_url!, {
      transform: {
        height:300, width: 300,
        resize: 'contain'
      }
    }).data.publicUrl;
  })

  return { data, count, error };
}, "maps")


const Maps: Component = () => {
  // const [maps, setMaps] = createSignal<Tables<'maps'>[]>();
  const maps = createAsync(() => getMaps());



  return <>
    <For each={maps()?.data} fallback={<Fallback isLoading={maps()?.count == 0} />}>
      {(map) => <MapPreview map={map} />}
    </For>
    <A href='/maps/create'>Criar novo mapa</A>
  </>
    ;
};

export default Maps;
