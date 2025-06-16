import { A, useNavigate } from '@solidjs/router';
import PencilRuler from 'lucide-solid/icons/pencil-ruler';
import Trash2Icon from 'lucide-solid/icons/trash-2';
import { createSignal, mergeProps, Show, type Component } from 'solid-js';
import { Button } from '~/lib/solidui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '~/lib/solidui/dialog';
import { Tables } from '~/lib/supabase/database.types';
import { LoadingSpinner } from './loading/LoadingSpinner.component';

type MapPreviewProps = {
  map: Tables<'maps'>;
  writable?: false;
} | {
  map: Tables<'maps'>;
  writable: true;
  onDeleteMap: () => void;
};

const MapPreview: Component<MapPreviewProps> = (_props) => {
  const props = mergeProps({ writabble: false }, _props) as unknown as MapPreviewProps;
  const editRoute = `/maps/${props.map.id}/edit`;
  const navigate = useNavigate();

  const [deleteModalOpen, setDeleteModalOpen] = createSignal(false);
  const [isDeletingMap, setIsDeletingMap] = createSignal(false);

  const handleDeleteMap = async () => {
    setIsDeletingMap(true);

    if (_props.writable) await _props.onDeleteMap();

    setIsDeletingMap(false);
    setDeleteModalOpen(false);
  };

  return (
    <div class='inline-flex flex-col gap-2'>
      <div>
        <h2>Map ID: {props.map.id}</h2>
        <p>Created at: {new Date(props.map.created_at).toLocaleString()}</p>
      </div>
      <button on:click={() => navigate(`/maps/${props.map.id}`)} class='self-center justify-center content-center place-self-center justify-self-center'>
        <img src={props.map.background_url!} alt={`Map ${props.map.id}`} />
      </button>
      <Show when={props.writable}>
        <div class='flex space-x-2 justify-center'>
          <Button variant="secondary" as={A} href={editRoute}><PencilRuler /></Button>


          <Dialog open={deleteModalOpen()} onOpenChange={setDeleteModalOpen}>
            <DialogTrigger as={Button} variant="destructive">
              <Trash2Icon />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Atenção</DialogTitle>
                <DialogDescription>
                  Tem certeza que quer apagar esse mapa?
                  Essa ação é irreversível.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter class='sm:justify-center'>
                <Button variant='ghost' class='hover:bg-destructive/70' onClick={handleDeleteMap}>
                  {isDeletingMap() ? <LoadingSpinner /> : "Sim"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Show>
    </div>
  );
};

export default MapPreview;