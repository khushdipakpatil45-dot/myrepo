export interface HighwayNode {
  chainage_km: number;
  name: string;
  lat: number;
  lon: number;
  critical_risk?: boolean;
}

export interface CorridorData {
  id: string;
  name: string;
  state: string;
  district: string;
  totalLengthKm: number;
  center: [number, number]; // [lat, lon]
  zoom: number;
  nodes: HighwayNode[];
  bypass: {
    name: string;
    distanceKm: number;
    timeMinutes: number;
    checkpoints: Array<{ name: string; status: string }>;
    coordinates: [number, number][]; // [lon, lat]
  };
}

export const CORRIDORS_DATA: Record<string, CorridorData> = {
  'NH-10': {
    id: 'NH-10',
    name: 'Siliguri - Sevoke - Gangtok',
    state: 'Sikkim & West Bengal',
    district: 'East Sikkim / Darjeeling',
    totalLengthKm: 114.5,
    center: [27.15, 88.50],
    zoom: 10,
    nodes: [
      { chainage_km: 0.0, name: 'Siliguri Hub', lat: 26.7271, lon: 88.3953 },
      { chainage_km: 21.2, name: 'Sevoke Bridge', lat: 26.8837, lon: 88.4688 },
      { chainage_km: 29.4, name: '29th Mile (Teesta Gorge)', lat: 26.9851, lon: 88.4612, critical_risk: true },
      { chainage_km: 42.0, name: 'Teesta Bazaar', lat: 27.0543, lon: 88.4982 },
      { chainage_km: 52.5, name: 'Melli Junction', lat: 27.0864, lon: 88.4552 },
      { chainage_km: 75.8, name: 'Rangpo Border Post', lat: 27.1764, lon: 88.5298 },
      { chainage_km: 92.4, name: 'Singtam Valley', lat: 27.2341, lon: 88.5028 },
      { chainage_km: 114.5, name: 'Gangtok Terminal', lat: 27.3389, lon: 88.6065 },
    ],
    bypass: {
      name: 'Siliguri -> Lava -> Algarah -> Kalimpong -> Gangtok Bypass',
      distanceKm: 142.8,
      timeMinutes: 275,
      checkpoints: [
        { name: 'Sevoke Army Post', status: 'OPEN' },
        { name: 'Lava Pass Junction', status: 'OPEN' },
        { name: 'Algarah Checkpoint', status: 'OPEN' },
        { name: 'Rangpo Entry', status: 'CONTROLLED' },
      ],
      coordinates: [
        [88.3953, 26.7271],
        [88.4688, 26.8837],
        [88.6631, 27.0864],
        [88.5833, 27.1210],
        [88.4735, 27.0600],
        [88.5298, 27.1764],
        [88.6065, 27.3389],
      ],
    },
  },
  'NH-27': {
    id: 'NH-27',
    name: 'Lumding - Haflong - Silchar (Dima Hasao Corridor)',
    state: 'Assam',
    district: 'Dima Hasao (North Cachar)',
    totalLengthKm: 198.0,
    center: [25.22, 93.05],
    zoom: 10,
    nodes: [
      { chainage_km: 0.0, name: 'Lumding Junction', lat: 25.7533, lon: 93.1706 },
      { chainage_km: 42.0, name: 'Maibang Station', lat: 25.3050, lon: 93.1650 },
      { chainage_km: 88.5, name: 'Haflong Hill Cut (Jatinga Valley)', lat: 25.1682, lon: 93.0298, critical_risk: true },
      { chainage_km: 112.0, name: 'Mahur Escarpment', lat: 25.1800, lon: 93.1200, critical_risk: true },
      { chainage_km: 154.0, name: 'Harangajao Mudflow Basin', lat: 24.9800, lon: 92.8600, critical_risk: true },
      { chainage_km: 198.0, name: 'Silchar Gateway', lat: 24.8333, lon: 92.7789 },
    ],
    bypass: {
      name: 'Lumding -> Lanka -> Umrangso -> Badarpur Tactical Link',
      distanceKm: 234.0,
      timeMinutes: 390,
      checkpoints: [
        { name: 'Umrangso Hydro Post', status: 'OPEN' },
        { name: 'Diyungbra Army Checkpoint', status: 'OPEN' },
        { name: 'Badarpur Terminal', status: 'OPEN' },
      ],
      coordinates: [
        [93.1706, 25.7533],
        [92.8500, 25.5100],
        [92.6800, 25.1500],
        [92.7789, 24.8333],
      ],
    },
  },
  'SH-5': {
    id: 'SH-5',
    name: 'Shillong - Sohra (Cherrapunji) - Dawki Ridge',
    state: 'Meghalaya',
    district: 'East Khasi Hills',
    totalLengthKm: 82.0,
    center: [25.38, 91.80],
    zoom: 10,
    nodes: [
      { chainage_km: 0.0, name: 'Shillong Upper Peak', lat: 25.5788, lon: 91.8933 },
      { chainage_km: 28.0, name: 'Mawkdok Dympep Valley Gorge', lat: 25.3560, lon: 91.7580, critical_risk: true },
      { chainage_km: 54.0, name: 'Sohra Plateau Rim', lat: 25.2700, lon: 91.7300, critical_risk: true },
      { chainage_km: 82.0, name: 'Dawki Border Crossing', lat: 25.1800, lon: 92.0200 },
    ],
    bypass: {
      name: 'Shillong -> Pynursla -> Dawki Safe Ridge Link',
      distanceKm: 94.0,
      timeMinutes: 150,
      checkpoints: [
        { name: 'Mylliem Checkpoint', status: 'OPEN' },
        { name: 'Pynursla Pass', status: 'OPEN' },
      ],
      coordinates: [
        [91.8933, 25.5788],
        [91.9100, 25.3100],
        [92.0200, 25.1800],
      ],
    },
  },
  'NH-310A': {
    id: 'NH-310A',
    name: 'Mangan - Chungthang - Lachen - Lachung',
    state: 'Sikkim',
    district: 'North Sikkim',
    totalLengthKm: 96.0,
    center: [27.60, 88.58],
    zoom: 10,
    nodes: [
      { chainage_km: 0.0, name: 'Mangan District HQ', lat: 27.5050, lon: 88.5300 },
      { chainage_km: 24.5, name: 'Singhik Slide Zone', lat: 27.5250, lon: 88.5450 },
      { chainage_km: 52.0, name: 'Chungthang Breach Basin', lat: 27.6040, lon: 88.6470, critical_risk: true },
      { chainage_km: 74.0, name: 'Munshithang Moraine Slump', lat: 27.6800, lon: 88.5800, critical_risk: true },
      { chainage_km: 96.0, name: 'Lachen Outpost', lat: 27.7167, lon: 88.5577 },
    ],
    bypass: {
      name: 'Mangan -> Dzongu -> Chungthang Military Trail',
      distanceKm: 112.0,
      timeMinutes: 260,
      checkpoints: [
        { name: 'Sankalang Bridge', status: 'CONTROLLED' },
        { name: 'Passingdang Post', status: 'OPEN' },
      ],
      coordinates: [
        [88.5300, 27.5050],
        [88.4800, 27.5600],
        [88.6470, 27.6040],
      ],
    },
  },
  'NH-306': {
    id: 'NH-306',
    name: 'Silchar - Vairengte - Kolasib - Aizawl',
    state: 'Mizoram',
    district: 'Aizawl & Kolasib',
    totalLengthKm: 178.0,
    center: [24.10, 92.70],
    zoom: 9,
    nodes: [
      { chainage_km: 0.0, name: 'Silchar Border Post', lat: 24.8333, lon: 92.7789 },
      { chainage_km: 36.0, name: 'Vairengte Gate', lat: 24.5100, lon: 92.7600 },
      { chainage_km: 84.0, name: 'Kolasib Ridge', lat: 24.2250, lon: 92.6780 },
      { chainage_km: 128.0, name: 'Kawnpui Landslip Zone', lat: 23.9800, lon: 92.6800, critical_risk: true },
      { chainage_km: 158.0, name: 'Sairang Valley InSAR Creep', lat: 23.8050, lon: 92.6650, critical_risk: true },
      { chainage_km: 178.0, name: 'Aizawl Capital Terminal', lat: 23.7271, lon: 92.7176 },
    ],
    bypass: {
      name: 'Vairengte -> Bairabi -> Mamit -> Aizawl Western Bypass',
      distanceKm: 210.0,
      timeMinutes: 340,
      checkpoints: [
        { name: 'Bairabi Railway Bridge', status: 'OPEN' },
        { name: 'Mamit Crossroads', status: 'OPEN' },
      ],
      coordinates: [
        [92.7600, 24.5100],
        [92.5300, 24.1900],
        [92.4900, 23.9200],
        [92.7176, 23.7271],
      ],
    },
  },
  'NH-13': {
    id: 'NH-13',
    name: 'Bhalukpong - Bomdila - Sela Pass - Tawang (Trans-Arunachal)',
    state: 'Arunachal Pradesh',
    district: 'Tawang & West Kameng',
    totalLengthKm: 290.0,
    center: [27.40, 92.20],
    zoom: 9,
    nodes: [
      { chainage_km: 0.0, name: 'Bhalukpong Gateway', lat: 27.0125, lon: 92.6480 },
      { chainage_km: 98.0, name: 'Bomdila Pass', lat: 27.2644, lon: 92.4225 },
      { chainage_km: 142.0, name: 'Dirang Valley Slump', lat: 27.3580, lon: 92.2350 },
      { chainage_km: 210.0, name: 'Sela Pass Scree & Snowslip', lat: 27.5042, lon: 92.1039, critical_risk: true },
      { chainage_km: 252.0, name: 'Jaswant Garh Ridge', lat: 27.5250, lon: 92.0100 },
      { chainage_km: 290.0, name: 'Tawang Command Post', lat: 27.5861, lon: 91.8594 },
    ],
    bypass: {
      name: 'Bhalukpong -> Tenga -> Sela Tunnel Emergency Bypass',
      distanceKm: 272.0,
      timeMinutes: 420,
      checkpoints: [
        { name: 'Tenga Valley Army Base', status: 'OPEN' },
        { name: 'Sela Tunnel West Portal', status: 'OPEN' },
      ],
      coordinates: [
        [92.6480, 27.0125],
        [92.4225, 27.2644],
        [92.1150, 27.4950],
        [91.8594, 27.5861],
      ],
    },
  },
  'NH-29': {
    id: 'NH-29',
    name: 'Dimapur - Kohima - Imphal',
    state: 'Nagaland & Manipur',
    district: 'Kohima / Dimapur',
    totalLengthKm: 215.0,
    center: [25.75, 93.90],
    zoom: 10,
    nodes: [
      { chainage_km: 0.0, name: 'Dimapur Hub', lat: 25.9068, lon: 93.7271 },
      { chainage_km: 14.5, name: 'Chumukedima', lat: 25.7950, lon: 93.7712 },
      { chainage_km: 28.0, name: 'Pagla Pahar (Creep Zone)', lat: 25.8123, lon: 93.8341, critical_risk: true },
      { chainage_km: 45.2, name: 'Medziphema', lat: 25.7580, lon: 93.8650 },
      { chainage_km: 68.4, name: 'Old KMC Sinking Site', lat: 25.6841, lon: 94.0812, critical_risk: true },
      { chainage_km: 74.0, name: 'Kohima Capital', lat: 25.6751, lon: 94.1086 },
    ],
    bypass: {
      name: 'Dimapur -> Niuland -> Ghaspani -> Kohima Bypass',
      distanceKm: 96.4,
      timeMinutes: 210,
      checkpoints: [
        { name: 'Chumukedima Gate', status: 'OPEN' },
        { name: 'Niuland Bridge', status: 'OPEN' },
        { name: 'Jotsoma Entry', status: 'OPEN' },
      ],
      coordinates: [
        [93.7271, 25.9068],
        [93.8100, 25.8500],
        [93.9200, 25.7800],
        [94.1086, 25.6751],
      ],
    },
  },
  'NH-6': {
    id: 'NH-6',
    name: 'Guwahati - Shillong - Silchar',
    state: 'Meghalaya & Assam',
    district: 'East Jaintia Hills / Ri-Bhoi',
    totalLengthKm: 308.0,
    center: [25.40, 92.20],
    zoom: 9,
    nodes: [
      { chainage_km: 0.0, name: 'Guwahati Gateway', lat: 26.1445, lon: 91.7362 },
      { chainage_km: 52.0, name: 'Nongpoh', lat: 25.9038, lon: 91.8790 },
      { chainage_km: 99.0, name: 'Shillong Plateau', lat: 25.5788, lon: 91.8933 },
      { chainage_km: 164.0, name: 'Jowai (Jaintia Hills)', lat: 25.4526, lon: 92.2030 },
      { chainage_km: 242.0, name: 'Sonapur Tunnel', lat: 25.1098, lon: 92.3650, critical_risk: true },
      { chainage_km: 308.0, name: 'Silchar Valley', lat: 24.8333, lon: 92.7789 },
    ],
    bypass: {
      name: 'Shillong -> Dawki -> Amlarem -> Silchar Southern Link',
      distanceKm: 245.0,
      timeMinutes: 360,
      checkpoints: [
        { name: 'Pynursla Checkpost', status: 'OPEN' },
        { name: 'Dawki Border Bridge', status: 'OPEN' },
        { name: 'Badarpur Junction', status: 'OPEN' },
      ],
      coordinates: [
        [91.8933, 25.5788],
        [91.9800, 25.3200],
        [92.0200, 25.1800],
        [92.4000, 24.9500],
        [92.7789, 24.8333],
      ],
    },
  },
};
