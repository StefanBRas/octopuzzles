import type {
  Borderclues,
  Borders,
  Cellclues,
  Cornerclues,
  Dimensions,
  Extendedcages,
  KillerCages,
  Line,
  Position,
  SudokuSymbols
} from '$models/Sudoku';
import arrayfrom0ToN from '$utils/arrayfrom0ToN';

export function getAllCellClues(
  cellclues?: Cellclues,
  cornerclues?: Cornerclues,
  symbols?: SudokuSymbols
): Cellclues | undefined {
  if (cornerclues == null && symbols == null) return cellclues;

  const newClues: Cellclues = [];
  if (cornerclues) {
    cornerclues.forEach((row, rowIndex) => {
      row.forEach((clue, columnIndex) => {
        if (clue) {
          const position: Position = { row: rowIndex, column: columnIndex };
          if (clue.nw !== '') {
            newClues.push({
              position,
              type: undefined,
              text: clue.nw,
              location: 'TopLeft',
              size: 'XSmall',
              symbol: undefined,
              rotation: undefined,
              color: undefined
            });
          }
          if (clue.ne !== '') {
            newClues.push({
              position,
              type: undefined,
              text: clue.nw,
              location: 'TopRight',
              size: 'XSmall',
              symbol: undefined,
              rotation: undefined,
              color: undefined
            });
          }
          if (clue.sw !== '') {
            newClues.push({
              position,
              type: undefined,
              text: clue.nw,
              location: 'BottomLeft',
              size: 'XSmall',
              symbol: undefined,
              rotation: undefined,
              color: undefined
            });
          }
          if (clue.se !== '') {
            newClues.push({
              position,
              type: undefined,
              text: clue.nw,
              location: 'BottomRight',
              size: 'XSmall',
              symbol: undefined,
              rotation: undefined,
              color: undefined
            });
          }
        }
      });
    });
  }

  if (symbols) {
    symbols.forEach((row, rowIndex) => {
      row.forEach((cell, columnIndex) => {
        if (cell) {
          const position: Position = { row: rowIndex, column: columnIndex };
          cell.forEach((symbol) => {
            newClues.push({
              position,
              type: undefined,
              text: undefined,
              location: undefined,
              size: undefined,
              symbol: symbol.type,
              rotation: symbol.rotation,
              color: undefined
            });
          });
        }
      });
    });
  }

  if (newClues.length) {
    if (cellclues == null || cellclues.length === 0) {
      return newClues;
    } else {
      return [...newClues, ...cellclues];
    }
  } else {
    return cellclues;
  }
}

export function isDefaultBorders(borders?: Borders, dimensions?: Dimensions): boolean {
  if (borders == null) return true;

  let defaultBorders: Line[];
  const xOffset = dimensions?.margins?.left ?? 0;
  const yOffset = dimensions?.margins?.top ?? 0;
  const rows = (dimensions?.rows ?? 9) - yOffset - (dimensions?.margins?.bottom ?? 0);
  const columns = (dimensions?.columns ?? 9) - xOffset - (dimensions?.margins?.right ?? 0);
  if (rows === 6 && columns === 6) {
    defaultBorders = [
      { x1: xOffset + 0, y1: yOffset + 0, x2: xOffset + 1, y2: yOffset + 0 },
      { x1: xOffset + 1, y1: yOffset + 0, x2: xOffset + 2, y2: yOffset + 0 },
      { x1: xOffset + 2, y1: yOffset + 0, x2: xOffset + 3, y2: yOffset + 0 },
      { x1: xOffset + 3, y1: yOffset + 0, x2: xOffset + 4, y2: yOffset + 0 },
      { x1: xOffset + 4, y1: yOffset + 0, x2: xOffset + 5, y2: yOffset + 0 },
      { x1: xOffset + 5, y1: yOffset + 0, x2: xOffset + 6, y2: yOffset + 0 },
      { x1: xOffset + 0, y1: yOffset + 2, x2: xOffset + 1, y2: yOffset + 2 },
      { x1: xOffset + 1, y1: yOffset + 2, x2: xOffset + 2, y2: yOffset + 2 },
      { x1: xOffset + 2, y1: yOffset + 2, x2: xOffset + 3, y2: yOffset + 2 },
      { x1: xOffset + 3, y1: yOffset + 2, x2: xOffset + 4, y2: yOffset + 2 },
      { x1: xOffset + 4, y1: yOffset + 2, x2: xOffset + 5, y2: yOffset + 2 },
      { x1: xOffset + 5, y1: yOffset + 2, x2: xOffset + 6, y2: yOffset + 2 },
      { x1: xOffset + 0, y1: yOffset + 4, x2: xOffset + 1, y2: yOffset + 4 },
      { x1: xOffset + 1, y1: yOffset + 4, x2: xOffset + 2, y2: yOffset + 4 },
      { x1: xOffset + 2, y1: yOffset + 4, x2: xOffset + 3, y2: yOffset + 4 },
      { x1: xOffset + 3, y1: yOffset + 4, x2: xOffset + 4, y2: yOffset + 4 },
      { x1: xOffset + 4, y1: yOffset + 4, x2: xOffset + 5, y2: yOffset + 4 },
      { x1: xOffset + 5, y1: yOffset + 4, x2: xOffset + 6, y2: yOffset + 4 },
      { x1: xOffset + 0, y1: yOffset + 6, x2: xOffset + 1, y2: yOffset + 6 },
      { x1: xOffset + 1, y1: yOffset + 6, x2: xOffset + 2, y2: yOffset + 6 },
      { x1: xOffset + 2, y1: yOffset + 6, x2: xOffset + 3, y2: yOffset + 6 },
      { x1: xOffset + 3, y1: yOffset + 6, x2: xOffset + 4, y2: yOffset + 6 },
      { x1: xOffset + 4, y1: yOffset + 6, x2: xOffset + 5, y2: yOffset + 6 },
      { x1: xOffset + 5, y1: yOffset + 6, x2: xOffset + 6, y2: yOffset + 6 },
      { x1: xOffset + 0, y1: yOffset + 0, x2: xOffset + 0, y2: yOffset + 1 },
      { x1: xOffset + 0, y1: yOffset + 1, x2: xOffset + 0, y2: yOffset + 2 },
      { x1: xOffset + 0, y1: yOffset + 2, x2: xOffset + 0, y2: yOffset + 3 },
      { x1: xOffset + 0, y1: yOffset + 3, x2: xOffset + 0, y2: yOffset + 4 },
      { x1: xOffset + 0, y1: yOffset + 4, x2: xOffset + 0, y2: yOffset + 5 },
      { x1: xOffset + 0, y1: yOffset + 5, x2: xOffset + 0, y2: yOffset + 6 },
      { x1: xOffset + 3, y1: yOffset + 0, x2: xOffset + 3, y2: yOffset + 1 },
      { x1: xOffset + 3, y1: yOffset + 1, x2: xOffset + 3, y2: yOffset + 2 },
      { x1: xOffset + 3, y1: yOffset + 2, x2: xOffset + 3, y2: yOffset + 3 },
      { x1: xOffset + 3, y1: yOffset + 3, x2: xOffset + 3, y2: yOffset + 4 },
      { x1: xOffset + 3, y1: yOffset + 4, x2: xOffset + 3, y2: yOffset + 5 },
      { x1: xOffset + 3, y1: yOffset + 5, x2: xOffset + 3, y2: yOffset + 6 },
      { x1: xOffset + 6, y1: yOffset + 0, x2: xOffset + 6, y2: yOffset + 1 },
      { x1: xOffset + 6, y1: yOffset + 1, x2: xOffset + 6, y2: yOffset + 2 },
      { x1: xOffset + 6, y1: yOffset + 2, x2: xOffset + 6, y2: yOffset + 3 },
      { x1: xOffset + 6, y1: yOffset + 3, x2: xOffset + 6, y2: yOffset + 4 },
      { x1: xOffset + 6, y1: yOffset + 4, x2: xOffset + 6, y2: yOffset + 5 },
      { x1: xOffset + 6, y1: yOffset + 5, x2: xOffset + 6, y2: yOffset + 6 }
    ];
  } else if (rows === 9 && columns === 9) {
    // For 9x9 do the regular stuff
    defaultBorders = [
      { x1: xOffset + 0, y1: yOffset + 0, x2: xOffset + 1, y2: yOffset + 0 },
      { x1: xOffset + 1, y1: yOffset + 0, x2: xOffset + 2, y2: yOffset + 0 },
      { x1: xOffset + 2, y1: yOffset + 0, x2: xOffset + 3, y2: yOffset + 0 },
      { x1: xOffset + 3, y1: yOffset + 0, x2: xOffset + 4, y2: yOffset + 0 },
      { x1: xOffset + 4, y1: yOffset + 0, x2: xOffset + 5, y2: yOffset + 0 },
      { x1: xOffset + 5, y1: yOffset + 0, x2: xOffset + 6, y2: yOffset + 0 },
      { x1: xOffset + 6, y1: yOffset + 0, x2: xOffset + 7, y2: yOffset + 0 },
      { x1: xOffset + 7, y1: yOffset + 0, x2: xOffset + 8, y2: yOffset + 0 },
      { x1: xOffset + 8, y1: yOffset + 0, x2: xOffset + 9, y2: yOffset + 0 },
      { x1: xOffset + 0, y1: yOffset + 3, x2: xOffset + 1, y2: yOffset + 3 },
      { x1: xOffset + 1, y1: yOffset + 3, x2: xOffset + 2, y2: yOffset + 3 },
      { x1: xOffset + 2, y1: yOffset + 3, x2: xOffset + 3, y2: yOffset + 3 },
      { x1: xOffset + 3, y1: yOffset + 3, x2: xOffset + 4, y2: yOffset + 3 },
      { x1: xOffset + 4, y1: yOffset + 3, x2: xOffset + 5, y2: yOffset + 3 },
      { x1: xOffset + 5, y1: yOffset + 3, x2: xOffset + 6, y2: yOffset + 3 },
      { x1: xOffset + 6, y1: yOffset + 3, x2: xOffset + 7, y2: yOffset + 3 },
      { x1: xOffset + 7, y1: yOffset + 3, x2: xOffset + 8, y2: yOffset + 3 },
      { x1: xOffset + 8, y1: yOffset + 3, x2: xOffset + 9, y2: yOffset + 3 },
      { x1: xOffset + 0, y1: yOffset + 6, x2: xOffset + 1, y2: yOffset + 6 },
      { x1: xOffset + 1, y1: yOffset + 6, x2: xOffset + 2, y2: yOffset + 6 },
      { x1: xOffset + 2, y1: yOffset + 6, x2: xOffset + 3, y2: yOffset + 6 },
      { x1: xOffset + 3, y1: yOffset + 6, x2: xOffset + 4, y2: yOffset + 6 },
      { x1: xOffset + 4, y1: yOffset + 6, x2: xOffset + 5, y2: yOffset + 6 },
      { x1: xOffset + 5, y1: yOffset + 6, x2: xOffset + 6, y2: yOffset + 6 },
      { x1: xOffset + 6, y1: yOffset + 6, x2: xOffset + 7, y2: yOffset + 6 },
      { x1: xOffset + 7, y1: yOffset + 6, x2: xOffset + 8, y2: yOffset + 6 },
      { x1: xOffset + 8, y1: yOffset + 6, x2: xOffset + 9, y2: yOffset + 6 },
      { x1: xOffset + 0, y1: yOffset + 9, x2: xOffset + 1, y2: yOffset + 9 },
      { x1: xOffset + 1, y1: yOffset + 9, x2: xOffset + 2, y2: yOffset + 9 },
      { x1: xOffset + 2, y1: yOffset + 9, x2: xOffset + 3, y2: yOffset + 9 },
      { x1: xOffset + 3, y1: yOffset + 9, x2: xOffset + 4, y2: yOffset + 9 },
      { x1: xOffset + 4, y1: yOffset + 9, x2: xOffset + 5, y2: yOffset + 9 },
      { x1: xOffset + 5, y1: yOffset + 9, x2: xOffset + 6, y2: yOffset + 9 },
      { x1: xOffset + 6, y1: yOffset + 9, x2: xOffset + 7, y2: yOffset + 9 },
      { x1: xOffset + 7, y1: yOffset + 9, x2: xOffset + 8, y2: yOffset + 9 },
      { x1: xOffset + 8, y1: yOffset + 9, x2: xOffset + 9, y2: yOffset + 9 },
      { x1: xOffset + 0, y1: yOffset + 0, x2: xOffset + 0, y2: yOffset + 1 },
      { x1: xOffset + 0, y1: yOffset + 1, x2: xOffset + 0, y2: yOffset + 2 },
      { x1: xOffset + 0, y1: yOffset + 2, x2: xOffset + 0, y2: yOffset + 3 },
      { x1: xOffset + 0, y1: yOffset + 3, x2: xOffset + 0, y2: yOffset + 4 },
      { x1: xOffset + 0, y1: yOffset + 4, x2: xOffset + 0, y2: yOffset + 5 },
      { x1: xOffset + 0, y1: yOffset + 5, x2: xOffset + 0, y2: yOffset + 6 },
      { x1: xOffset + 0, y1: yOffset + 6, x2: xOffset + 0, y2: yOffset + 7 },
      { x1: xOffset + 0, y1: yOffset + 7, x2: xOffset + 0, y2: yOffset + 8 },
      { x1: xOffset + 0, y1: yOffset + 8, x2: xOffset + 0, y2: yOffset + 9 },
      { x1: xOffset + 3, y1: yOffset + 0, x2: xOffset + 3, y2: yOffset + 1 },
      { x1: xOffset + 3, y1: yOffset + 1, x2: xOffset + 3, y2: yOffset + 2 },
      { x1: xOffset + 3, y1: yOffset + 2, x2: xOffset + 3, y2: yOffset + 3 },
      { x1: xOffset + 3, y1: yOffset + 3, x2: xOffset + 3, y2: yOffset + 4 },
      { x1: xOffset + 3, y1: yOffset + 4, x2: xOffset + 3, y2: yOffset + 5 },
      { x1: xOffset + 3, y1: yOffset + 5, x2: xOffset + 3, y2: yOffset + 6 },
      { x1: xOffset + 3, y1: yOffset + 6, x2: xOffset + 3, y2: yOffset + 7 },
      { x1: xOffset + 3, y1: yOffset + 7, x2: xOffset + 3, y2: yOffset + 8 },
      { x1: xOffset + 3, y1: yOffset + 8, x2: xOffset + 3, y2: yOffset + 9 },
      { x1: xOffset + 6, y1: yOffset + 0, x2: xOffset + 6, y2: yOffset + 1 },
      { x1: xOffset + 6, y1: yOffset + 1, x2: xOffset + 6, y2: yOffset + 2 },
      { x1: xOffset + 6, y1: yOffset + 2, x2: xOffset + 6, y2: yOffset + 3 },
      { x1: xOffset + 6, y1: yOffset + 3, x2: xOffset + 6, y2: yOffset + 4 },
      { x1: xOffset + 6, y1: yOffset + 4, x2: xOffset + 6, y2: yOffset + 5 },
      { x1: xOffset + 6, y1: yOffset + 5, x2: xOffset + 6, y2: yOffset + 6 },
      { x1: xOffset + 6, y1: yOffset + 6, x2: xOffset + 6, y2: yOffset + 7 },
      { x1: xOffset + 6, y1: yOffset + 7, x2: xOffset + 6, y2: yOffset + 8 },
      { x1: xOffset + 6, y1: yOffset + 8, x2: xOffset + 6, y2: yOffset + 9 },
      { x1: xOffset + 9, y1: yOffset + 0, x2: xOffset + 9, y2: yOffset + 1 },
      { x1: xOffset + 9, y1: yOffset + 1, x2: xOffset + 9, y2: yOffset + 2 },
      { x1: xOffset + 9, y1: yOffset + 2, x2: xOffset + 9, y2: yOffset + 3 },
      { x1: xOffset + 9, y1: yOffset + 3, x2: xOffset + 9, y2: yOffset + 4 },
      { x1: xOffset + 9, y1: yOffset + 4, x2: xOffset + 9, y2: yOffset + 5 },
      { x1: xOffset + 9, y1: yOffset + 5, x2: xOffset + 9, y2: yOffset + 6 },
      { x1: xOffset + 9, y1: yOffset + 6, x2: xOffset + 9, y2: yOffset + 7 },
      { x1: xOffset + 9, y1: yOffset + 7, x2: xOffset + 9, y2: yOffset + 8 },
      { x1: xOffset + 9, y1: yOffset + 8, x2: xOffset + 9, y2: yOffset + 9 }
    ];
  }

  // Just put a border around the outside
  defaultBorders = [];
  arrayfrom0ToN(rows).forEach((n) => {
    defaultBorders.push(
      { x1: xOffset + 0, x2: xOffset + 0, y1: yOffset + n, y2: yOffset + n + 1 },
      {
        x1: xOffset + (dimensions?.columns ?? 9),
        x2: xOffset + (dimensions?.columns ?? 9),
        y1: yOffset + n,
        y2: yOffset + n + 1
      }
    );
  });
  arrayfrom0ToN(columns).forEach((n) => {
    defaultBorders.push(
      { y1: yOffset + 0, y2: yOffset + 0, x1: xOffset + n, x2: xOffset + n + 1 },
      {
        y1: yOffset + (dimensions?.rows ?? 9),
        y2: yOffset + (dimensions?.rows ?? 9),
        x1: xOffset + n,
        x2: xOffset + n + 1
      }
    );
  });

  if (borders.length !== defaultBorders.length) return false;
  for (let i = 0; i < borders.length; ++i) {
    if (JSON.stringify(borders[i]) !== JSON.stringify(defaultBorders[i])) return false;
  }

  return true;
}

export function getAllBorderClues(
  borderClues?: Borderclues,
  borders?: Borders,
  dimensions?: Dimensions
): Borderclues | undefined {
  if (borders == null || borders.length === 0 || isDefaultBorders(borders, dimensions))
    return borderClues;

  const newClues: Borderclues = borders.map((border) => {
    return {
      positions:
        border.y1 === border.y2
          ? [
              { row: border.y1 - 1, column: border.x1 },
              { row: border.y2, column: border.x2 - 1 }
            ]
          : [
              { row: border.y1, column: border.x1 - 1 },
              { row: border.y2 - 1, column: border.x2 }
            ],
      type: 'Border',
      text: undefined,
      color: undefined
    };
  });
  if (borderClues == null) {
    return newClues;
  } else {
    return [...newClues, ...borderClues];
  }
}

export function getAllCages(
  cages?: Extendedcages,
  killercages?: KillerCages
): Extendedcages | undefined {
  if (killercages == null || killercages.length == 0) return cages;

  const newCages: Extendedcages = killercages.map((cage) => {
    return { positions: cage, type: undefined, text: undefined, color: undefined };
  });
  if (cages == null) {
    return newCages;
  } else {
    return [...newCages, ...cages];
  }
}
