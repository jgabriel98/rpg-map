import { fileUploader, UploadFile } from '@solid-primitives/upload';
import { useNavigate } from '@solidjs/router';
import { createSignal, Show, type Component } from 'solid-js';

import { useSession } from '~/contexts/Session.context';
import { buckets } from '~/lib/supabase';
import { Tables } from '~/lib/supabase/database.types';
import { deleteMap, insertMap, updateMap } from '~/services/map';
import { HexMap } from '../components/HexMap.component';
import { HexGridProvider } from '../directives';
import MapEditGUI from '../components/MapEditGUI.component';

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
fileUploader; // Preserve the import.

const uploadToBucket = async (userId: string, mapId: MapId, file: File) => {
  const path = `${userId}/${mapId}/${file.name}`;
  const { data, error } = await buckets.mapsAssets.upload(path, file);
  if (error) throw error;
  return data;
};

const updateMapBackgroundUrl = async (id: MapId, backgroundUrl: string) => {
  const { data, error } = await updateMap(id, { background_url: backgroundUrl });
  if (error) throw error;
  return data;
};

type MapId = Tables<'maps'>['id'];

const CreateMap: Component = () => {
  const [files, setFiles] = createSignal<UploadFile[]>([]);
  const backgroundImageFile = () => files().at(0);
  const [tileRadius, setTileRadius] = createSignal(25);
  const [tileCost, setTileCost] = createSignal(1);

  const session = useSession();
  const navigate = useNavigate();


  const submit = async () => {
    const [backgroundFile] = files();
    if (!backgroundFile) return;

    // TODO: migrate all this logic to rpc {@link https://supabase.com/docs/reference/javascript/rpc}
    const { data, error } = await insertMap({
      hex_tile_radius: tileRadius(),
      tile_cost: tileCost(),
      background_url: ""
    });

    if (error) throw error;

    const mapId = data.id;
    try {
      const { path } = await uploadToBucket(session()!.user.id, mapId, backgroundFile.file);

      try { await updateMapBackgroundUrl(mapId, path); }
      catch (err) {
        buckets.mapsAssets.remove([path]);
        throw err;
      }

    } catch (err) {
      deleteMap(mapId);
      throw err;
    }

    navigate('/maps', { replace: true });
  };

  return (
    <HexGridProvider>
      <div class='z-10 absolute flex flex-col'>
        <div>
          <label for="files" class="btn">Envie a imagem de fundo do mapa: </label>
          <input
            type="file"
            accept='image/*'
            multiple={false}
            use:fileUploader={{
              userCallback: (_) => { },
              setFiles,
            }}
          />
        </div>

        <MapEditGUI tileCost={tileCost()} tileRadius={tileRadius()} onSetTileCost={setTileCost} onSetTileRadius={setTileRadius} />
        <button on:click={submit}>salvar</button>

      </div>
      <Show when={backgroundImageFile()?.source}>
        <HexMap backgroundSrc={backgroundImageFile()!.source} tileRadius={tileRadius()} tileCost={tileCost()} />
      </Show>
    </HexGridProvider>
  );
};

export default CreateMap;
