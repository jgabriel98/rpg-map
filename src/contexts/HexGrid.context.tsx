import { Accessor, createContext, createEffect, createRenderEffect, createSignal, JSX, on, Setter, useContext } from "solid-js";
import HexGrid from "~/models/HexGrid.model";
import { HexTile } from "~/models/HexTile.model";

interface HexGridContext<T extends HexTile> {
  grid: Accessor<HexGrid<T> | undefined>
  setGrid: Setter<HexGrid<T> | undefined>
  selectTile: (tile: T, unselect?: boolean) => void
  createPath: (start: HexTile, goal: HexTile) => Array<HexTile>
  clearPath: (path: Iterable<HexTile>) => void
}

export const HexGridContext = createContext<HexGridContext<HexTile>>();

interface HexGridProviderProps {
  children: JSX.Element
}

const noop: (...args: any[]) => any = () => { };
 
export function HexGridProvider(props: HexGridProviderProps) {
  const [grid, setGrid] = createSignal<HexGrid<HexTile>>();
  const [selectedTiles, setSelectedTiles] = createSignal<HexTile[]>([]);

  const selectTile = <T extends HexTile>(tile: T, unselect = false) => {
    if (!grid()?.hasHex(tile)) throw new Error("tile does not belong to this grid");

    tile.selected = !unselect;
    const newSelecteds = [...selectedTiles()]

    if (tile.selected) newSelecteds.push(tile);
    else newSelecteds.splice(newSelecteds.findIndex(v => v === tile), 1);
    setSelectedTiles(newSelecteds);
  }

  createRenderEffect(
    on(grid, () => setSelectedTiles([]))
  )


  createEffect((previousPath?: HexTile[]) => {
    const _grid = grid();
    if (!_grid) return undefined;
    const tilesList = selectedTiles();

    if (previousPath) _grid.clearPath(previousPath);

    if (tilesList.length == 2) {
      return _grid.createPath(tilesList[0], tilesList[1]);
    }

    return undefined;
  });

  const createPath = grid()?.createPath ?? noop;
  const clearPath = grid()?.clearPath ?? noop;

  return (
    <HexGridContext.Provider value={{ grid, setGrid, selectTile, createPath, clearPath }}>
      {props.children}
    </HexGridContext.Provider>
  );
}

export function useHexGrid() {
  const context = useContext(HexGridContext);
  if (!context) throw new Error("useHexGrid() called outside of <HexGridProvider />")

  const { grid, selectTile } = context;
  return { grid, selectTile };
}