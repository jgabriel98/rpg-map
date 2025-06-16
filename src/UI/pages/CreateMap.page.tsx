import { fileUploader, UploadFile } from '@solid-primitives/upload';
import { useNavigate } from '@solidjs/router';
import { createSignal, Show, type Component } from 'solid-js';
import { Button } from '~/lib/solidui/button';
import { Flex } from '~/lib/solidui/flex';
import { Label } from '~/lib/solidui/label';

import { createMap } from '~/services/map.service';
import { HexMap } from '~/UI/components/HexMap.component';
import MapEditGUI from '~/UI/components/MapEditGUI.component';
import { HexGridProvider } from '~/UI/directives';
import { LoadingSpinner } from '../components/loading/LoadingSpinner.component';

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
fileUploader; // Preserve the import.


const CreateMap: Component = () => {
  const [files, setFiles] = createSignal<UploadFile[]>([]);
  const backgroundImageFile = () => files().at(0);
  const [tileRadius, setTileRadius] = createSignal(25);
  const [tileCost, setTileCost] = createSignal(1);

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = createSignal(false);

  const submit = async () => {
    const [backgroundFile] = files();
    if (!backgroundFile) return;
    setIsLoading(true);

    await createMap({
      hex_tile_radius: tileRadius(),
      tile_cost: tileCost(),
      backgroundFile: backgroundFile.file
    });

    setIsLoading(false);
    navigate('/maps', { replace: true });
  };

  return (
    <HexGridProvider>
      <Flex flexDirection='col' alignItems='start' class='z-10 w-min max-w-96 p-3 gap-y-2 rounded-br-xl bg-black/30 backdrop-blur-sm shadow-black shadow-xl/30'>
        <Flex flexDirection='col' alignItems='start' class='gap-y-1'>
          <Label for="files">Envie a imagem de fundo do mapa: </Label>
          <input
            type="file"
            accept='image/*'
            multiple={false}
            use:fileUploader={{
              userCallback: (_) => { },
              setFiles,
            }}
          />
        </Flex>

        <MapEditGUI tileCost={tileCost()} tileRadius={tileRadius()} onSetTileCost={setTileCost} onSetTileRadius={setTileRadius} />
        <Button onClick={submit} disabled={isLoading()} class='self-center mt-3'>
          {isLoading() ? <LoadingSpinner /> : "Salvar"}
        </Button>

      </Flex>

      <Show when={backgroundImageFile()?.source}>
        <HexMap backgroundSrc={backgroundImageFile()!.source} tileRadius={tileRadius()} tileCost={tileCost()} />
      </Show>
    </HexGridProvider>
  );
};

export default CreateMap;
