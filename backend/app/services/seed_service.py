from typing import Dict, Any, List

class SeedCorridorData:
    """
    Geospatial ground-truth seed fixtures for high-priority North Eastern Region corridors.
    """

    CORRIDORS: Dict[str, Dict[str, Any]] = {
        "NH-10": {
            "name": "Siliguri - Sevoke - Gangtok",
            "state_region": "Sikkim & West Bengal",
            "total_length_km": 114.5,
            "origin": {"name": "Siliguri Junction", "lat": 26.7271, "lon": 88.3953},
            "destination": {"name": "Gangtok (Tashiling)", "lat": 27.3389, "lon": 88.6065},
            "key_nodes": [
                {"chainage_km": 0.0, "name": "Siliguri", "lat": 26.7271, "lon": 88.3953},
                {"chainage_km": 21.2, "name": "Sevoke Bridge", "lat": 26.8837, "lon": 88.4688},
                {"chainage_km": 29.4, "name": "29th Mile (Teesta Gorge)", "lat": 26.9851, "lon": 88.4612, "critical_risk": True},
                {"chainage_km": 42.0, "name": "Teesta Bazaar", "lat": 27.0543, "lon": 88.4982},
                {"chainage_km": 52.5, "name": "Melli Junction", "lat": 27.0864, "lon": 88.4552},
                {"chainage_km": 75.8, "name": "Rangpo Border Post", "lat": 27.1764, "lon": 88.5298},
                {"chainage_km": 92.4, "name": "Singtam", "lat": 27.2341, "lon": 88.5028},
                {"chainage_km": 114.5, "name": "Gangtok Terminal", "lat": 27.3389, "lon": 88.6065}
            ],
            "bypass_route": {
                "name": "Siliguri -> Lava -> Algarah -> Kalimpong -> Gangtok Bypass",
                "distance_km": 142.8,
                "time_minutes": 275,
                "checkpoints": [
                    {"name": "Sevoke Army Post", "status": "OPEN"},
                    {"name": "Lava Pass Junction", "status": "OPEN"},
                    {"name": "Algarah Checkpoint", "status": "OPEN"},
                    {"name": "Rangpo Entry", "status": "CONTROLLED_ACCESS"}
                ],
                "coordinates": [
                    [88.3953, 26.7271],
                    [88.4688, 26.8837],
                    [88.6631, 27.0864],
                    [88.5833, 27.1210],
                    [88.4735, 27.0600],
                    [88.5298, 27.1764],
                    [88.6065, 27.3389]
                ]
            }
        },
        "NH-29": {
            "name": "Dimapur - Kohima - Imphal",
            "state_region": "Nagaland & Manipur",
            "total_length_km": 215.0,
            "origin": {"name": "Dimapur Hub", "lat": 25.9068, "lon": 93.7271},
            "destination": {"name": "Kohima Capital", "lat": 25.6751, "lon": 94.1086},
            "key_nodes": [
                {"chainage_km": 0.0, "name": "Dimapur", "lat": 25.9068, "lon": 93.7271},
                {"chainage_km": 14.5, "name": "Chumukedima", "lat": 25.7950, "lon": 93.7712},
                {"chainage_km": 28.0, "name": "Pagla Pahar (Creep Zone)", "lat": 25.8123, "lon": 93.8341, "critical_risk": True},
                {"chainage_km": 45.2, "name": "Medziphema", "lat": 25.7580, "lon": 93.8650},
                {"chainage_km": 68.4, "name": "Old KMC Sinking Site", "lat": 25.6841, "lon": 94.0812, "critical_risk": True},
                {"chainage_km": 74.0, "name": "Kohima", "lat": 25.6751, "lon": 94.1086}
            ],
            "bypass_route": {
                "name": "Dimapur -> Niuland -> Ghaspani -> Kohima Bypass",
                "distance_km": 96.4,
                "time_minutes": 210,
                "checkpoints": [
                    {"name": "Chumukedima Gate", "status": "OPEN"},
                    {"name": "Niuland Bridge", "status": "OPEN"},
                    {"name": "Jotsoma Entry", "status": "OPEN"}
                ],
                "coordinates": [
                    [93.7271, 25.9068],
                    [93.8100, 25.8500],
                    [93.9200, 25.7800],
                    [94.1086, 25.6751]
                ]
            }
        },
        "NH-6": {
            "name": "Guwahati - Shillong - Silchar",
            "state_region": "Meghalaya & Assam",
            "total_length_km": 308.0,
            "origin": {"name": "Guwahati Gateway", "lat": 26.1445, "lon": 91.7362},
            "destination": {"name": "Silchar Valley", "lat": 24.8333, "lon": 92.7789},
            "key_nodes": [
                {"chainage_km": 0.0, "name": "Guwahati", "lat": 26.1445, "lon": 91.7362},
                {"chainage_km": 52.0, "name": "Nongpoh", "lat": 25.9038, "lon": 91.8790},
                {"chainage_km": 99.0, "name": "Shillong", "lat": 25.5788, "lon": 91.8933},
                {"chainage_km": 164.0, "name": "Jowai (Jaintia Hills)", "lat": 25.4526, "lon": 92.2030},
                {"chainage_km": 242.0, "name": "Sonapur Tunnel Mudflow", "lat": 25.1098, "lon": 92.3650, "critical_risk": True},
                {"chainage_km": 308.0, "name": "Silchar", "lat": 24.8333, "lon": 92.7789}
            ],
            "bypass_route": {
                "name": "Shillong -> Dawki -> Amlarem -> Silchar Southern Link",
                "distance_km": 245.0,
                "time_minutes": 360,
                "checkpoints": [
                    {"name": "Pynursla Checkpost", "status": "OPEN"},
                    {"name": "Dawki Border Bridge", "status": "OPEN"},
                    {"name": "Badarpur Junction", "status": "OPEN"}
                ],
                "coordinates": [
                    [91.8933, 25.5788],
                    [91.9800, 25.3200],
                    [92.0200, 25.1800],
                    [92.4000, 24.9500],
                    [92.7789, 24.8333]
                ]
            }
        },
        "NH-27": {
            "name": "Lumding - Haflong - Silchar (Dima Hasao Chokepoint)",
            "state_region": "Assam (Dima Hasao)",
            "total_length_km": 198.0,
            "origin": {"name": "Lumding Junction", "lat": 25.7533, "lon": 93.1706},
            "destination": {"name": "Silchar Terminal", "lat": 24.8333, "lon": 92.7789},
            "key_nodes": [
                {"chainage_km": 0.0, "name": "Lumding Junction", "lat": 25.7533, "lon": 93.1706},
                {"chainage_km": 42.0, "name": "Maibang Hill Segment", "lat": 25.3050, "lon": 93.1650},
                {"chainage_km": 88.5, "name": "Haflong Hill Cut (Jatinga Valley)", "lat": 25.1682, "lon": 93.0298, "critical_risk": True},
                {"chainage_km": 112.0, "name": "Mahur Escarpment", "lat": 25.1800, "lon": 93.1200, "critical_risk": True},
                {"chainage_km": 154.0, "name": "Harangajao Landslide Basin", "lat": 24.9800, "lon": 92.8600, "critical_risk": True},
                {"chainage_km": 198.0, "name": "Silchar Hub", "lat": 24.8333, "lon": 92.7789}
            ],
            "bypass_route": {
                "name": "Lumding -> Lanka -> Umrangso -> Badarpur Tactical Link",
                "distance_km": 234.0,
                "time_minutes": 390,
                "checkpoints": [
                    {"name": "Umrangso Hydro Post", "status": "OPEN"},
                    {"name": "Diyungbra Army Checkpoint", "status": "OPEN"},
                    {"name": "Badarpur Terminal", "status": "OPEN"}
                ],
                "coordinates": [
                    [93.1706, 25.7533],
                    [92.8500, 25.5100],
                    [92.6800, 25.1500],
                    [92.7789, 24.8333]
                ]
            }
        },
        "SH-5": {
            "name": "Shillong - Sohra (Cherrapunji) - Dawki Ridge",
            "state_region": "Meghalaya (East Khasi Hills)",
            "total_length_km": 82.0,
            "origin": {"name": "Shillong Peak Link", "lat": 25.5788, "lon": 91.8933},
            "destination": {"name": "Dawki Border Gateway", "lat": 25.1800, "lon": 92.0200},
            "key_nodes": [
                {"chainage_km": 0.0, "name": "Shillong Upper Peak", "lat": 25.5788, "lon": 91.8933},
                {"chainage_km": 28.0, "name": "Mawkdok Dympep Valley Gorge", "lat": 25.3560, "lon": 91.7580, "critical_risk": True},
                {"chainage_km": 54.0, "name": "Sohra Plateau Rim", "lat": 25.2700, "lon": 91.7300, "critical_risk": True},
                {"chainage_km": 82.0, "name": "Dawki Umngot Crossing", "lat": 25.1800, "lon": 92.0200}
            ],
            "bypass_route": {
                "name": "Shillong -> Pynursla -> Dawki Safe Ridge",
                "distance_km": 94.0,
                "time_minutes": 150,
                "checkpoints": [
                    {"name": "Mylliem Checkpoint", "status": "OPEN"},
                    {"name": "Pynursla Pass", "status": "OPEN"}
                ],
                "coordinates": [
                    [91.8933, 25.5788],
                    [91.9100, 25.3100],
                    [92.0200, 25.1800]
                ]
            }
        },
        "NH-310A": {
            "name": "Mangan - Chungthang - Lachen - Lachung (Teesta Headwaters)",
            "state_region": "Sikkim (North Sikkim)",
            "total_length_km": 96.0,
            "origin": {"name": "Mangan District HQ", "lat": 27.5050, "lon": 88.5300},
            "destination": {"name": "Lachen - Lachung Fork", "lat": 27.6040, "lon": 88.6470},
            "key_nodes": [
                {"chainage_km": 0.0, "name": "Mangan", "lat": 27.5050, "lon": 88.5300},
                {"chainage_km": 24.5, "name": "Singhik Viewpoint Slide", "lat": 27.5250, "lon": 88.5450},
                {"chainage_km": 52.0, "name": "Chungthang Dam Breach Zone", "lat": 27.6040, "lon": 88.6470, "critical_risk": True},
                {"chainage_km": 74.0, "name": "Munshithang Moraine Slump", "lat": 27.6800, "lon": 88.5800, "critical_risk": True},
                {"chainage_km": 96.0, "name": "Lachen Outpost", "lat": 27.7167, "lon": 88.5577}
            ],
            "bypass_route": {
                "name": "Mangan -> Dzongu -> Chungthang Military Trail",
                "distance_km": 112.0,
                "time_minutes": 260,
                "checkpoints": [
                    {"name": "Sankalang Bridge", "status": "CONTROLLED"},
                    {"name": "Passingdang Post", "status": "OPEN"}
                ],
                "coordinates": [
                    [88.5300, 27.5050],
                    [88.4800, 27.5600],
                    [88.6470, 27.6040]
                ]
            }
        },
        "NH-306": {
            "name": "Silchar - Vairengte - Kolasib - Aizawl",
            "state_region": "Mizoram (Aizawl & Kolasib)",
            "total_length_km": 178.0,
            "origin": {"name": "Silchar Border Link", "lat": 24.8333, "lon": 92.7789},
            "destination": {"name": "Aizawl Capital Terminal", "lat": 23.7271, "lon": 92.7176},
            "key_nodes": [
                {"chainage_km": 0.0, "name": "Silchar", "lat": 24.8333, "lon": 92.7789},
                {"chainage_km": 36.0, "name": "Vairengte Gate", "lat": 24.5100, "lon": 92.7600},
                {"chainage_km": 84.0, "name": "Kolasib Ridge", "lat": 24.2250, "lon": 92.6780},
                {"chainage_km": 128.0, "name": "Kawnpui Landslip Zone", "lat": 23.9800, "lon": 92.6800, "critical_risk": True},
                {"chainage_km": 158.0, "name": "Sairang Valley InSAR Creep", "lat": 23.8050, "lon": 92.6650, "critical_risk": True},
                {"chainage_km": 178.0, "name": "Aizawl Khatla", "lat": 23.7271, "lon": 92.7176}
            ],
            "bypass_route": {
                "name": "Vairengte -> Bairabi -> Mamit -> Aizawl Western Bypass",
                "distance_km": 210.0,
                "time_minutes": 340,
                "checkpoints": [
                    {"name": "Bairabi Railway Bridge", "status": "OPEN"},
                    {"name": "Mamit Crossroads", "status": "OPEN"}
                ],
                "coordinates": [
                    [92.7600, 24.5100],
                    [92.5300, 24.1900],
                    [92.4900, 23.9200],
                    [92.7176, 23.7271]
                ]
            }
        },
        "NH-13": {
            "name": "Bhalukpong - Bomdila - Sela Pass - Tawang (Trans-Arunachal)",
            "state_region": "Arunachal Pradesh (West Kameng & Tawang)",
            "total_length_km": 290.0,
            "origin": {"name": "Bhalukpong Gateway", "lat": 27.0125, "lon": 92.6480},
            "destination": {"name": "Tawang Military Station", "lat": 27.5861, "lon": 91.8594},
            "key_nodes": [
                {"chainage_km": 0.0, "name": "Bhalukpong", "lat": 27.0125, "lon": 92.6480},
                {"chainage_km": 98.0, "name": "Bomdila Pass", "lat": 27.2644, "lon": 92.4225},
                {"chainage_km": 142.0, "name": "Dirang Valley Slump", "lat": 27.3580, "lon": 92.2350},
                {"chainage_km": 210.0, "name": "Sela Pass Scree & Snowslip", "lat": 27.5042, "lon": 92.1039, "critical_risk": True},
                {"chainage_km": 252.0, "name": "Jaswant Garh Ridge", "lat": 27.5250, "lon": 92.0100},
                {"chainage_km": 290.0, "name": "Tawang Command Post", "lat": 27.5861, "lon": 91.8594}
            ],
            "bypass_route": {
                "name": "Bhalukpong -> Tenga -> Sela Tunnel Emergency Bypass",
                "distance_km": 272.0,
                "time_minutes": 420,
                "checkpoints": [
                    {"name": "Tenga Valley Army Base", "status": "OPEN"},
                    {"name": "Sela Tunnel West Portal", "status": "OPEN"}
                ],
                "coordinates": [
                    [92.6480, 27.0125],
                    [92.4225, 27.2644],
                    [92.1150, 27.4950],
                    [91.8594, 27.5861]
                ]
            }
        }
    }

    @classmethod
    def get_corridor(cls, corridor_id: str) -> Dict[str, Any]:
        return cls.CORRIDORS.get(corridor_id, cls.CORRIDORS["NH-10"])

    @classmethod
    def list_all_corridors(cls) -> List[Dict[str, Any]]:
        return [
            {
                "id": cid,
                "name": data["name"],
                "state_region": data["state_region"],
                "total_length_km": data["total_length_km"]
            }
            for cid, data in cls.CORRIDORS.items()
        ]
