import { Color, Morphable, Polygon, Text } from "@svgdotjs/svg.js";
import { aStar } from "abstract-astar";
import { Grid, ring } from "honeycomb-grid";
import HexTile from "~/models/HexTile";


export function createShortestPath_AStar(grid: Grid<HexTile>, start: HexTile, goal: HexTile) {
  return aStar<HexTile>({
    start,
    goal,
    estimateFromNodeToGoal: (tile) => grid.distance(tile, goal),
    neighborsAdjacentToNode: (center) => grid.traverse(ring({ radius: 1, center })).toArray(),
    actualCostToMove: (_, __, tile) => tile.cost,
  })
}

export function paintTraversablePath(grid: Grid<HexTile>, path: HexTile[]) {
  const startTile = path[0];
  const goalTile = path[path.length - 1];
  let index = 0;
  let totalCost = 0;

  const pathColorRange = new Color('#490657').to('#490657');
  function getTileFill(tile: HexTile, morphableColor: Morphable) {
    const MAX_COST = 8;
    return morphableColor.at(tile.cost * index / MAX_COST).toHex();
  }

  grid
    .traverse(path ?? [])
    .filter((tile) => !tile.equals([startTile.q, startTile.r]))
    .forEach((tile) => {
      const fill = getTileFill(tile, pathColorRange);
      const animationStep = easeInCubic(index / path.length) * 1000;
      tile.svgPolygon.animate(200, animationStep, 'start').fill(fill)
      tile.svgPolygon.animate(1, animationStep, 'start').opacity(0.4)
      tile.svgGroup.addClass("path-painted")
      index++;
      totalCost += tile.cost;
    })

  // path.filter((tile) => !tile.equals([start.q, start.r]))
  //   .forEach((tile) => {
  //     const fill = getTileFill(tile, pathColorRange);
  //     tile.svgPolygon.opacity(0.3).animate(undefined, index++ * 100).fill(fill)
  //   })

    renderText(startTile, '0');
    renderText(goalTile, `${totalCost}`)

  return path ?? [];
}

export function unpaintTraversablePath(path: Iterable<HexTile>) {
  for (let tile of path) {
    
    tile.svgPolygon.attr({ fill: 'none', opacity: 1 })
    tile.svgGroup.removeClass("path-painted");
    (tile.svgGroup.findOne('text') as Text)?.remove()
  }
}


/** source: https://easings.net/#easeInCubic */
function easeInCubic(x: number): number {
  return x * x * x;
}

function renderText(tile: HexTile, text: string) {
    tile.svgGroup.text(text)
    .font({
      size: tile.width * 0.5,
      anchor: 'middle',
      'dominant-baseline': 'central',
      leading: 0,
      fill: '#fff'
    })
    .translate(tile.x, tile.y)
}