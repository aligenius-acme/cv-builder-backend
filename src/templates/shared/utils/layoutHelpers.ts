/**
 * Layout calculation utilities for PDF templates
 * Helps with positioning, alignment, and spacing calculations
 */

import { PageMargins, spacing } from '../styles/spacing';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rect extends Position, Size {}

/**
 * Calculate center position for element
 */
export function centerHorizontally(
  containerWidth: number,
  elementWidth: number,
  marginLeft: number = 0
): number {
  return marginLeft + (containerWidth - elementWidth) / 2;
}

/**
 * Calculate right-aligned position
 */
export function alignRight(
  containerWidth: number,
  elementWidth: number,
  marginRight: number = 0
): number {
  return containerWidth - elementWidth - marginRight;
}

/**
 * Calculate vertical center
 */
export function centerVertically(
  containerHeight: number,
  elementHeight: number,
  marginTop: number = 0
): number {
  return marginTop + (containerHeight - elementHeight) / 2;
}

/**
 * Calculate bottom-aligned position
 */
export function alignBottom(
  containerHeight: number,
  elementHeight: number,
  marginBottom: number = 0
): number {
  return containerHeight - elementHeight - marginBottom;
}

/**
 * Create a grid of positions
 */
export function createGrid(
  startX: number,
  startY: number,
  columns: number,
  rows: number,
  cellWidth: number,
  cellHeight: number,
  gutterX: number = 0,
  gutterY: number = 0
): Position[][] {
  const grid: Position[][] = [];

  for (let row = 0; row < rows; row++) {
    const rowPositions: Position[] = [];

    for (let col = 0; col < columns; col++) {
      rowPositions.push({
        x: startX + col * (cellWidth + gutterX),
        y: startY + row * (cellHeight + gutterY),
      });
    }

    grid.push(rowPositions);
  }

  return grid;
}

/**
 * Calculate positions for flex-like layout
 */
export function flexLayout(
  containerWidth: number,
  itemWidths: number[],
  gap: number = 0,
  justify: 'start' | 'end' | 'center' | 'space-between' | 'space-around' = 'start'
): number[] {
  const totalItemWidth = itemWidths.reduce((sum, width) => sum + width, 0);
  const totalGapWidth = gap * (itemWidths.length - 1);
  const remainingSpace = containerWidth - totalItemWidth - totalGapWidth;

  const positions: number[] = [];
  let currentX = 0;

  switch (justify) {
    case 'start':
      currentX = 0;
      break;
    case 'end':
      currentX = remainingSpace;
      break;
    case 'center':
      currentX = remainingSpace / 2;
      break;
    case 'space-between':
      currentX = 0;
      gap = itemWidths.length > 1 ? remainingSpace / (itemWidths.length - 1) : 0;
      break;
    case 'space-around':
      const spacePerItem = remainingSpace / itemWidths.length;
      currentX = spacePerItem / 2;
      gap = spacePerItem;
      break;
  }

  for (let i = 0; i < itemWidths.length; i++) {
    positions.push(currentX);
    currentX += itemWidths[i] + gap;
  }

  return positions;
}

/**
 * Calculate content bounds with margins
 */
export function getContentBounds(
  pageWidth: number,
  pageHeight: number,
  margins: PageMargins
): Rect {
  return {
    x: margins.left,
    y: margins.top,
    width: pageWidth - margins.left - margins.right,
    height: pageHeight - margins.top - margins.bottom,
  };
}

/**
 * Check if point is within bounds
 */
export function isWithinBounds(point: Position, bounds: Rect): boolean {
  return (
    point.x >= bounds.x &&
    point.x <= bounds.x + bounds.width &&
    point.y >= bounds.y &&
    point.y <= bounds.y + bounds.height
  );
}

/**
 * Calculate aspect ratio fit
 */
export function fitToAspectRatio(
  containerSize: Size,
  aspectRatio: number,
  mode: 'contain' | 'cover' = 'contain'
): Size {
  const containerRatio = containerSize.width / containerSize.height;

  if (mode === 'contain') {
    if (containerRatio > aspectRatio) {
      // Container is wider
      return {
        width: containerSize.height * aspectRatio,
        height: containerSize.height,
      };
    } else {
      // Container is taller
      return {
        width: containerSize.width,
        height: containerSize.width / aspectRatio,
      };
    }
  } else {
    // cover mode
    if (containerRatio > aspectRatio) {
      // Container is wider
      return {
        width: containerSize.width,
        height: containerSize.width / aspectRatio,
      };
    } else {
      // Container is taller
      return {
        width: containerSize.height * aspectRatio,
        height: containerSize.height,
      };
    }
  }
}

/**
 * Stack elements vertically with spacing
 */
export function stackVertical(
  startY: number,
  heights: number[],
  gaps: number[] | number = spacing[4]
): number[] {
  const positions: number[] = [];
  let currentY = startY;

  for (let i = 0; i < heights.length; i++) {
    positions.push(currentY);
    currentY += heights[i];

    if (i < heights.length - 1) {
      const gap = Array.isArray(gaps) ? gaps[i] : gaps;
      currentY += gap;
    }
  }

  return positions;
}

/**
 * Stack elements horizontally with spacing
 */
export function stackHorizontal(
  startX: number,
  widths: number[],
  gaps: number[] | number = spacing[4]
): number[] {
  const positions: number[] = [];
  let currentX = startX;

  for (let i = 0; i < widths.length; i++) {
    positions.push(currentX);
    currentX += widths[i];

    if (i < widths.length - 1) {
      const gap = Array.isArray(gaps) ? gaps[i] : gaps;
      currentX += gap;
    }
  }

  return positions;
}

/**
 * Calculate column positions for multi-column layout
 */
export function calculateColumns(
  contentWidth: number,
  columnCount: number,
  gutterWidth: number = spacing[8]
): { columnWidth: number; positions: number[] } {
  const totalGutterWidth = gutterWidth * (columnCount - 1);
  const columnWidth = (contentWidth - totalGutterWidth) / columnCount;

  const positions: number[] = [];
  for (let i = 0; i < columnCount; i++) {
    positions.push(i * (columnWidth + gutterWidth));
  }

  return { columnWidth, positions };
}

/**
 * Distribute items across columns (masonry-style)
 */
export function distributeToColumns<T>(
  items: T[],
  columnCount: number
): T[][] {
  const columns: T[][] = Array.from({ length: columnCount }, () => []);

  items.forEach((item, index) => {
    const columnIndex = index % columnCount;
    columns[columnIndex].push(item);
  });

  return columns;
}

/**
 * Calculate safe area (accounting for bleed in print)
 */
export function getSafeArea(
  bounds: Rect,
  bleed: number = 9 // 1/8 inch
): Rect {
  return {
    x: bounds.x + bleed,
    y: bounds.y + bleed,
    width: bounds.width - 2 * bleed,
    height: bounds.height - 2 * bleed,
  };
}

/**
 * Scale size proportionally
 */
export function scaleSize(size: Size, scale: number): Size {
  return {
    width: size.width * scale,
    height: size.height * scale,
  };
}

/**
 * Calculate remaining height in page
 */
export function getRemainingHeight(
  currentY: number,
  pageHeight: number,
  bottomMargin: number
): number {
  return pageHeight - currentY - bottomMargin;
}

/**
 * Check if content fits on page
 */
export function fitsOnPage(
  currentY: number,
  contentHeight: number,
  pageHeight: number,
  bottomMargin: number
): boolean {
  return currentY + contentHeight <= pageHeight - bottomMargin;
}

/**
 * Calculate pagination for content
 */
export function paginateContent<T>(
  items: T[],
  itemHeights: number[],
  pageHeight: number,
  topMargin: number,
  bottomMargin: number,
  headerHeight: number = 0
): T[][] {
  const pages: T[][] = [];
  let currentPage: T[] = [];
  let currentPageHeight = topMargin + headerHeight;
  const availableHeight = pageHeight - topMargin - bottomMargin;

  items.forEach((item, index) => {
    const itemHeight = itemHeights[index];

    if (currentPageHeight + itemHeight > availableHeight && currentPage.length > 0) {
      // Start new page
      pages.push(currentPage);
      currentPage = [];
      currentPageHeight = topMargin + headerHeight;
    }

    currentPage.push(item);
    currentPageHeight += itemHeight;
  });

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  return pages;
}
