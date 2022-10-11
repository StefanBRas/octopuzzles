import type { Position } from '$models/Sudoku';

/**
 * Finds the top left of positions in a list.
 * Prioritises tops.
 * If leftmost has lower index than topmost, uses left most, otherwise topmost
 */
export function topLeftOfPositions(positions: Position[]): Position {
  let leftMostPosition = positions[0];
  let topMostPosition = positions[0];

  for (const position of positions) {
    if (
      position.column < leftMostPosition.column ||
      (position.column == leftMostPosition.column && position.row < leftMostPosition.row)
    ) {
      leftMostPosition = position;
    }

    if (
      position.row < topMostPosition.row ||
      (position.row == topMostPosition.row && position.column < topMostPosition.column)
    ) {
      topMostPosition = position;
    }
  }

  return leftMostPosition.column < topMostPosition.row ? leftMostPosition : topMostPosition;
}
