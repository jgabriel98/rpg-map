import { A, createAsync, query, useNavigate } from '@solidjs/router';
import { User } from '@supabase/supabase-js';
import PencilRuler from 'lucide-solid/icons/pencil-ruler';
import Trash2Icon from 'lucide-solid/icons/trash-2';
import { For, Suspense, type Component } from 'solid-js';
import { useSession } from '~/contexts/Session.context';
import { Button } from '~/lib/solidui/button';
import { Separator } from '~/lib/solidui/separator';
import { buckets, supabase } from '~/lib/supabase';
import { Tables } from '~/lib/supabase/database.types';
import { LoadingSpinner } from '../components/loading/LoadingSpinner.component';
import { Show } from 'solid-js';
import { Flex } from '~/lib/solidui/flex';

const MapPreview: Component<{ map: Tables<'maps'>, owner?: boolean }> = ({ map, owner = false }) => {
  const navigate = useNavigate()
  return (
    <div on:click={() => navigate(`/maps/${map.id}`)}>
      <h2>Map ID: {map.id}</h2>
      <p>Created at: {new Date(map.created_at).toLocaleString()}</p>
      <img src={map.background_url!} alt={`Map ${map.id}`} />
      <Show when={owner}>
        <div class='flex space-x-2'>
          <Button variant="secondary"><PencilRuler /></Button>
          <Button variant="destructive"><Trash2Icon /></Button>
        </div>
      </Show>
    </div>
  );
}

const getAllMaps = query(async (user?: User) => {
  if (!user) return;

  let { data, count, error } = await supabase.from("maps").select()

  data?.forEach(map => {
    map.background_url = buckets.mapsAssets.getPublicUrl(map.background_url!, {
      transform: {
        height: 300, width: 300,
        resize: 'contain'
      }
    }).data.publicUrl;
  })

  return { data, count, error };
}, "maps")


const Maps: Component = () => {
  const session = useSession();
  const allMapsQuery = createAsync(() => getAllMaps(session()?.user));

  const userMaps = () => allMapsQuery()?.data?.filter(map => map.owner_id == session()?.user.id);
  const otherUsersMaps = () => allMapsQuery()?.data?.filter(map => map.owner_id != session()?.user.id);

  return <Suspense fallback={<LoadingSpinner class='size-32 m-auto' />} >
    <Flex flexDirection="col" class="px-6">
      <h2 class="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Seus mapas
      </h2>
      <div style={{ display: 'flex', "flex-direction": "row" }}>
        <For each={userMaps()} fallback={<span class="text-neutral-400">Nenhum mapa cadastrado.</span>}>
          {(map) => <MapPreview map={map} owner />}
        </For>
      </div>
      <Button as={A} href='/maps/create' class="max-w-md w-full justify-self-center my-3">Criar novo mapa</Button>

      <Separator class='border-amber-500 border-2 w-4/5 my-12 mx-auto rounded-sm' />

      <h2 class="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Mapas de colegas
      </h2>
      <div class='flex flex-row space-x-4'>
        <For each={otherUsersMaps()} fallback={<span class="text-neutral-400">Nenhum mapa cadastrado.</span>}>
          {(map) => <MapPreview map={map} />}
        </For>
      </div>
    </Flex>
  </Suspense>;
};

export default Maps;
