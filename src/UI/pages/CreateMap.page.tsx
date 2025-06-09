import { createEffect, createSignal, createUniqueId, type Component } from 'solid-js';

import { fileUploader, UploadFile } from '@solid-primitives/upload';
import { buckets, supabase } from '~/lib/supabase';
import { useSession } from '~/contexts/Session.context';
import { Tables } from '~/lib/supabase/database.types';
import { useNavigate } from '@solidjs/router';
import { Show } from 'solid-js';
import { HexMap } from '../components/HexMap.component';
import { HexGridProvider } from '../directives';

fileUploader; // Preserve the import.

const uploadToBucket = async (userId: string, mapId: MapId, file: File) => {
  const path = `${userId}/${mapId}/${file.name}`;
  const { data, error } = await buckets.mapsAssets.upload(path, file);
  if (error) throw error;
  return data;
}

const updateMapBackgroundUrl = async (id: MapId, backgroundUrl: string) => {
  const { data, error } = await supabase.from('maps')
    .update({ background_url: backgroundUrl })
    .eq('id', id)
  if (error) throw error;
  return data;
}

type MapId = Tables<'maps'>['id'];

const CreateMap: Component = () => {
  const [files, setFiles] = createSignal<UploadFile[]>([]);
  const backgroundImageFile = () => files().at(0)
  const [tileRadius, setTileRadius] = createSignal(25);
  const [tileCost, setTileCost] = createSignal(1);

  const session = useSession();
  const navigate = useNavigate();


  const submit = async () => {
    const [backgroundFile] = files();
    if (!backgroundFile) return;

    const { data, error } = await supabase.from('maps').insert({
      hex_tile_radius: tileRadius(),
      tile_cost: tileCost(),
      background_url: ""
    }).select('id').single();
    if (error) throw error;

    const mapId = data.id;
    try {
      const { path } = await uploadToBucket(session()!.user.id, mapId, backgroundFile.file)

      try { await updateMapBackgroundUrl(mapId, path) }
      catch (err) {
        buckets.mapsAssets.remove([path]);
        throw err;
      }

    } catch (err) {
      supabase.from('maps').delete().eq('id', mapId);
      throw err;
    }

    navigate('/maps', { replace: true })
  }

  return (
    <HexGridProvider>
      <div style={{ position: 'absolute', display: 'flex', "flex-direction": "column" }}>
        <div>
        <label for="files" class="btn">Envie a imagem de fundo do mapa: </label>
        <input
          type="file"
          accept='image/*'
          multiple={false}
          use:fileUploader={{
            userCallback: _ => { },
            setFiles,
          }}
        />
        </div>

        <div>
          <span>Tamanho do bloco: </span>
          <span>{tileRadius()} </span>

          <button on:click={() => setTileRadius(tileRadius() + 1)}>+</button>
          <button on:click={() => setTileRadius(Math.max(tileRadius() - 1, 0))}>-</button>
        </div>

        <div>
          <span>Custo de movimento por bloco: </span>
          <span>{tileCost()} </span>

          <button on:click={() => setTileCost(tileCost() + 1)}>+</button>
          <button on:click={() => setTileCost(Math.max(tileCost() - 1, 0))}>-</button>

        </div>
        <button on:click={submit}>salvar</button>

      </div>
      <Show when={backgroundImageFile()?.source}>
        <HexMap backgroundSrc={backgroundImageFile()!.source} tileRadius={tileRadius()} tileCost={tileCost()}/>
      </Show>
    </HexGridProvider>
  );
};

export default CreateMap;
