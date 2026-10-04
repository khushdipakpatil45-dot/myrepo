import { create } from 'zustand';

export interface HazardState {
  selectedCorridor: string;
  activeTiers: Array<'NORMAL' | 'ADVISORY' | 'WARNING' | 'CRITICAL'>;
  activeLayers: {
    cartoDem: boolean;
    insarVelocity: boolean;
    factorOfSafety: boolean;
    cutSlopes: boolean;
    iotSensors: boolean;
    safeCorridor: boolean;
  };
  criticalZonesCount: number;
  blockedRoadSegments: string[];
  setSelectedCorridor: (corridor: string) => void;
  toggleLayer: (layerName: keyof HazardState['activeLayers']) => void;
  updateCriticalCount: (updater: (prev: number) => number) => void;
  addBlockedSegment: (segmentName: string) => void;
}

export const useHazardStore = create<HazardState>((set) => ({
  selectedCorridor: 'NH-10',
  activeTiers: ['WARNING', 'CRITICAL'],
  activeLayers: {
    cartoDem: true,
    insarVelocity: true,
    factorOfSafety: true,
    cutSlopes: true,
    iotSensors: true,
    safeCorridor: true,
  },
  criticalZonesCount: 0,
  blockedRoadSegments: [],
  setSelectedCorridor: (corridor) => set({ selectedCorridor: corridor }),
  toggleLayer: (layer) =>
    set((state) => ({
      activeLayers: { ...state.activeLayers, [layer]: !state.activeLayers[layer] },
    })),
  updateCriticalCount: (updater) =>
    set((state) => ({ criticalZonesCount: updater(state.criticalZonesCount) })),
  addBlockedSegment: (segmentName) =>
    set((state) => ({
      blockedRoadSegments: state.blockedRoadSegments.includes(segmentName)
        ? state.blockedRoadSegments
        : [...state.blockedRoadSegments, segmentName],
    })),
}));
