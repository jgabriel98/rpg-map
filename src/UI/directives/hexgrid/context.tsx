import { Grid, Hex } from "honeycomb-grid";
import { Accessor, createContext, createSignal, JSX, Setter, useContext } from "solid-js";
import HexTile from "../../../models/HexTile";
import { createShortestPath_AStar, paintTraversablePath, unpaintTraversablePath } from "./helpers";

interface HexGridContext<T extends Hex> {
  grid: Accessor<Grid<T> | undefined>
  setGrid: Setter<Grid<T> | undefined>
  createPath: (start: HexTile, goal: HexTile) => Array<HexTile>
  clearPath: (path: Iterable<HexTile>) => void
}

export const HexGridContext = createContext<HexGridContext<HexTile>>();

interface HexGridProviderProps {
  children: JSX.Element
}

export function HexGridProvider(props: HexGridProviderProps) {
  const [grid, setGrid] = createSignal<Grid<HexTile>>();

  const createPath = (start: HexTile, goal: HexTile) => {
    const _grid = grid();
    if (!_grid) throw new Error("Cannot create path without initializing Grid")

    const shortestPath = createShortestPath_AStar(_grid, start, goal);

    if(!shortestPath) throw new Error("there's no possible path")
    return paintTraversablePath(_grid, shortestPath)
  }

  const clearPath = (path: Iterable<HexTile>) => {
    unpaintTraversablePath(path);
  }

  return (
    <HexGridContext.Provider value={{ grid, setGrid, createPath, clearPath }}>
      {props.children}
    </HexGridContext.Provider>
  );
}

export function useHexGrid() {
  const { grid, createPath, clearPath} = useContext(HexGridContext)!;

  return { grid, createPath, clearPath};
}