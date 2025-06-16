import { A } from '@solidjs/router';
import { For, Suspense, type Component } from 'solid-js';
import { useSession } from '~/contexts/Session.context';
import { Button } from '~/lib/solidui/button';
import { Flex } from '~/lib/solidui/flex';
import { Separator } from '~/lib/solidui/separator';
import { showToast } from '~/lib/solidui/toast';
import { Tables } from '~/lib/supabase/database.types';
import { deleteMap, queryMaps } from '~/services/map';
import { LoadingSpinner } from '../components/loading/LoadingSpinner.component';
import MapPreview from '../components/MapPreview.component';


const Maps: Component = () => {
  const session = useSession();
  const [allMapsQuery, { deleteMutation: deleteMapMutation }] = queryMaps(session()?.user);

  const userMaps = () => allMapsQuery()?.data?.filter(map => map.owner_id == session()?.user.id);
  const otherUsersMaps = () => allMapsQuery()?.data?.filter(map => map.owner_id != session()?.user.id);

  const onDeleteMap = async (mapId: number) => {
    const { error } = await deleteMap(mapId);

    if (error) showToast({
      variant: 'warning',
      title: 'Falha ao deletar mapa',
      description: JSON.stringify(error)
    });
    else showToast({
      variant: 'destructive',
      title: `Mapa ${mapId} foi deletado`
    });

    deleteMapMutation(mapId);
  };

  return <Suspense fallback={<LoadingSpinner class='size-32 m-auto' />} >
    <Flex flexDirection="col" class="px-6">
      <h2 class="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Seus mapas
      </h2>
      <MapList writable maps={userMaps()} onDeleteMap={onDeleteMap} />
      <Button as={A} href='/maps/create' class="max-w-md w-full justify-self-center my-3">Criar novo mapa</Button>

      <Separator class='border-amber-500 border-2 w-4/5 my-12 mx-auto rounded-sm' />

      <h2 class="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Mapas de colegas
      </h2>
      <MapList maps={otherUsersMaps()} />
    </Flex>
  </Suspense>;
};

type MapListProps = {
  maps?: Tables<'maps'>[];
  writable?: false;
} | {
  maps?: Tables<'maps'>[];
  writable: true;
  onDeleteMap: (mapId: number) => void;
};

const MapList: Component<MapListProps> = (props) => {
  return <div class='flex flex-row flex-wrap gap-6'>
    <For each={props.maps} fallback={<span class="text-neutral-400">Nenhum mapa encontrado.</span>}>
      {(map) => {
        if (!props.writable) return <MapPreview map={map} writable={props.writable} />;
        return <MapPreview map={map} writable={props.writable} onDeleteMap={() => props.onDeleteMap(map.id)} />;
      }}
    </For>
  </div>;
};

export default Maps;
