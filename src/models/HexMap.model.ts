import HexGrid from "./HexGrid.model";
import { HexTile } from "./HexTile.model";


class HexMap<G extends HexGrid> {
  grid: HexGrid

  constructor(grid: G) {
    this.grid = grid;
  }
  

  // onClickHexTile<T extends HexTile>(hex: T) {
  //   let newArray = [...selectedTiles()];
  //   if (hex.selected) {
  //     newArray.push(hex)
  //   } else {
  //     const isPathEdge = previousPath[0] === hex || previousPath[previousPath.length - 1] === hex;
  //     if (isPathEdge) grid()?.clearPath(previousPath);
  //     newArray.splice(newArray.findIndex(v => v === hex), 1)
  //   }

  //   if (newArray.length === 2) {
  //     if (previousPath) clearPath(previousPath);
  //     previousPath = grid()?.createPath(newArray[0], newArray[1]);
  //   }

  //   setSelectedTiles(newArray);
  // }
}