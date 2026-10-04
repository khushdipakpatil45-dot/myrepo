import Dexie, { Table } from 'dexie';

export interface OfflineReport {
  id?: number;
  uuid: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  altitudeMeters?: number;
  compassAzimuthDegrees?: number;
  slopeTiltAngleDegrees?: number;
  hazardType: 'TENSION_CRACK' | 'ROCKFALL' | 'ROAD_SUBSIDENCE' | 'MUD_FLOW';
  severityEstimate: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  notes: string;
  photoBlob?: Blob;
  syncStatus: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';
  retryCount: number;
}

export class TerraCastDB extends Dexie {
  reports!: Table<OfflineReport>;

  constructor() {
    super('TerraCastFieldDB');
    this.version(1).stores({
      reports: '++id, uuid, timestamp, syncStatus, hazardType',
    });
  }
}

export const db = new TerraCastDB();
