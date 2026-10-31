import type { Bin } from './db.ts';

export interface RouteStep {
  stepNumber: number;
  bin: Bin;
  distanceFromPrevious: number;
  cumulativeDistance: number;
}

export interface RouteOptimizationResult {
  depot: { name: string; coord_x: number; coord_y: number };
  binsToCollectCount: number;
  totalDistance: number;
  estimatedTimeMinutes: number;
  steps: RouteStep[];
  overflowCount: number;
  collectionRequiredCount: number;
}

function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Deterministic Nearest-Neighbor route solver for bins >= 80% full
 */
export function calculateNearestNeighborRoute(allBins: Bin[]): RouteOptimizationResult {
  const depot = {
    name: 'Campus Operations & Logistics Hub',
    coord_x: 0,
    coord_y: 0,
  };

  // Filter ONLY bins requiring collection (fill_percentage >= 80)
  const candidates: Bin[] = allBins.filter((b) => b.fill_percentage >= 80);

  let overflowCount = 0;
  let collectionRequiredCount = 0;

  candidates.forEach((b) => {
    if (b.fill_percentage >= 100) overflowCount++;
    else collectionRequiredCount++;
  });

  if (candidates.length === 0) {
    return {
      depot,
      binsToCollectCount: 0,
      totalDistance: 0,
      estimatedTimeMinutes: 0,
      steps: [],
      overflowCount: 0,
      collectionRequiredCount: 0,
    };
  }

  // Clone list for unvisited tracking
  const unvisited: Bin[] = [...candidates];
  const steps: RouteStep[] = [];

  let currentX = depot.coord_x;
  let currentY = depot.coord_y;
  let cumulativeDistance = 0;
  let stepIndex = 1;

  while (unvisited.length > 0) {
    let bestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const b = unvisited[i];
      const dist = calculateDistance(currentX, currentY, b.coord_x, b.coord_y);

      // Deterministic choice: smaller distance, or alphabetical tie-break
      if (
        dist < minDistance ||
        (Math.abs(dist - minDistance) < 0.0001 && b.bin_name < unvisited[bestIndex].bin_name)
      ) {
        minDistance = dist;
        bestIndex = i;
      }
    }

    const nextBin = unvisited.splice(bestIndex, 1)[0];
    cumulativeDistance += minDistance;

    steps.push({
      stepNumber: stepIndex++,
      bin: nextBin,
      distanceFromPrevious: Math.round(minDistance * 10) / 10,
      cumulativeDistance: Math.round(cumulativeDistance * 10) / 10,
    });

    currentX = nextBin.coord_x;
    currentY = nextBin.coord_y;
  }

  // Estimated collection time: 2 min per distance unit + 4 min per bin collection
  const estimatedTimeMinutes = Math.round(cumulativeDistance * 0.4 + steps.length * 3.5);

  return {
    depot,
    binsToCollectCount: steps.length,
    totalDistance: Math.round(cumulativeDistance * 10) / 10,
    estimatedTimeMinutes,
    steps,
    overflowCount,
    collectionRequiredCount,
  };
}
