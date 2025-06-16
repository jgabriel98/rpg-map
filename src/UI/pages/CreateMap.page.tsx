import { fileUploader, UploadFile } from '@solid-primitives/upload';
import { useNavigate } from '@solidjs/router';
import { createSignal, Show, type Component } from 'solid-js';

import { createMap } from '~/services/map.service';
import { HexMap } from '~/UI/components/HexMap.component';
import MapEditGUI from '~/UI/components/MapEditGUI.component';
import { HexGridProvider } from '~/UI/directives';

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
fileUploader; // Preserve the import.


const CreateMap: Component = () => {
  const [files, setFiles] = createSignal<UploadFile[]>([]);
  const backgroundImageFile = () => files().at(0);
  const [tileRadius, setTileRadius] = createSignal(25);
  const [tileCost, setTileCost] = createSignal(1);

  const navigate = useNavigate();

  const submit = async () => {
    const [backgroundFile] = files();
    if (!backgroundFile) return;

    createMap({
      hex_tile_radius: tileRadius(),
      tile_cost: tileCost(),
      backgroundFile: backgroundFile.file
    });

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

        <MapEditGUI onSubmit={submit} tileCost={tileCost()} tileRadius={tileRadius()} onSetTileCost={setTileCost} onSetTileRadius={setTileRadius} />

      </div>
      <Show when={backgroundImageFile()?.source}>
        <HexMap backgroundSrc={backgroundImageFile()!.source} tileRadius={tileRadius()} tileCost={tileCost()} />
      </Show>
    </HexGridProvider>
  );
};

export default CreateMap;
