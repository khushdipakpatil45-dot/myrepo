from typing import Dict, Any, List

class RegionalIVRSEngine:
    """
    Multi-Lingual Outbound IVRS & SMS Dispatcher for North Eastern Region dialects:
    Khasi, Mizo, Assamese, Bodo, Garo, Nepali, Hindi, and English.
    """

    DIALECT_SCRIPTS: Dict[str, Dict[str, str]] = {
        "en": {
            "critical_title": "CRITICAL LANDSLIDE EVACUATION",
            "message": "Immediate danger of slope failure along highway corridor {corridor}. All transport must halt and divert to safe bypass route via {bypass}.",
            "sms_template": "EMERGENCY ALERT: Landslide triggered at {location}. Road BLOCKED. Take bypass via {bypass}. NDRF Helpline: 1070"
        },
        "khasi": {
            "critical_title": "JINGMAH KABA JUR NA KA JINGTWAD KHYNDEW",
            "message": "Ka jingtwad khyndew kaba shyrkhei kala sdang ha {corridor}. Sangeh lut ki kali bad phai sha ka surok kaba shngain lyngba {bypass}.",
            "sms_template": "JINGMAH KHLAB: Ka surok {corridor} kala sahkut ha {location}. Leit lyngba {bypass}. Phone: 1070"
        },
        "mizo": {
            "critical_title": "LEIMIN HLAUHAWM HRIATTIRNA",
            "message": "{corridor}-ah leimin a thleng mek a, motor zawng zawng ding nghal rawh se. {bypass} lam atangin kal rawh u.",
            "sms_template": "LEIMIN EMERGENCY: {corridor} kawng a ping mek ha {location}. {bypass} zawh rawh u. NDRF: 1070"
        },
        "assamese": {
            "critical_title": "ভূমিস্খলনৰ জৰুৰী সতৰ্কবাৰ্তা",
            "message": "{corridor} ঘাইপথত ভূমিস্খলনৰ প্ৰচণ্ড আশংকা। সকলো যান-বাহন তৎকালীনভাৱে বন্ধ কৰক আৰু {bypass} হৈ যাত্ৰা কৰক।",
            "sms_template": "জৰুৰী সতৰ্কতা: {corridor}ৰ {location}ত ভূমিস্খলন। পথ বন্ধ। {bypass}ৰে যাওক। হেল্পলাইন: ১০৭০"
        },
        "bodo": {
            "critical_title": "हा दैखांनायनि गिथावना जाथाय",
            "message": "{corridor} लामायाव हा दैखांनाय जादों। गासै गारिफोरखौ थाबनो दोनथ' आरो {bypass} लामाजों थां।",
            "sms_template": "गोख्रों खौरां: {location} आव हा दैखांदों। लामा बन्द। {bypass} जों थां। 1070"
        },
        "garo": {
            "critical_title": "A·A BE·ANI MIKRAKANI",
            "message": "{corridor} ramani a·a be·ani kakket ong·engaha. Gari gadengrangko dingtangate {bypass} ramako re·angbo.",
            "sms_template": "MIKRAKANI: {corridor} rama chipaha {location}. {bypass} ramako jakkalbo. Helpline: 1070"
        }
    }

    DISPATCH_HISTORY: List[Dict[str, Any]] = [
        {
            "id": "disp-001",
            "tier": "CRITICAL",
            "district": "Dima Hasao",
            "corridor": "NH-27",
            "location": "Haflong - Jatinga Valley",
            "timestamp": "09:45 IST",
            "dialects": ["Assamese", "English"],
            "targets": ["SDRF 3rd Bn", "Local Village Defense Parties (VDP)", "NF Railway HQ"],
            "channels": ["SIP IVRS Outbound", "Bulk SMS", "CAP-CP"],
            "summary": "[CRITICAL | Dima Hasao | 09:45 IST] IVRS & SMS dispatched to SDRF and Local Villages",
            "status": "DELIVERED_ACKNOWLEDGED"
        },
        {
            "id": "disp-002",
            "tier": "CRITICAL",
            "district": "East Khasi Hills",
            "corridor": "SH-5",
            "location": "Mawkdok Dympep Gorge",
            "timestamp": "09:15 IST",
            "dialects": ["Khasi", "English"],
            "targets": ["Meghalaya State Disaster Management (MSDMA)", "Sohra Police Outpost"],
            "channels": ["SIP Automated Call", "SMS Gateway"],
            "summary": "[CRITICAL | East Khasi Hills | 09:15 IST] IVRS & SMS dispatched to SDRF and Local Villages",
            "status": "DELIVERED"
        },
        {
            "id": "disp-003",
            "tier": "HIGH",
            "district": "North Sikkim",
            "corridor": "NH-310A",
            "location": "Chungthang Headwaters",
            "timestamp": "08:50 IST",
            "dialects": ["Nepali", "English"],
            "targets": ["BRO Project Swastik", "District Disaster Officer Mangan"],
            "channels": ["SMS Broadcast", "VHF Relay"],
            "summary": "[HIGH | North Sikkim | 08:50 IST] Soil saturation 91%. Pre-emptive traffic diversion intimation dispatched",
            "status": "DELIVERED"
        },
        {
            "id": "disp-004",
            "tier": "CRITICAL",
            "district": "Sikkim (NH-10)",
            "corridor": "NH-10",
            "location": "29th Mile (Teesta Gorge)",
            "timestamp": "08:10 IST",
            "dialects": ["Nepali", "Hindi", "English"],
            "targets": ["SDRF Gangtok", "NDRF 2nd Bn", "BRO Project Dantak"],
            "channels": ["SIP IVRS Broadcast", "SMS Gateway", "Disaster Alert API"],
            "summary": "[CRITICAL | NH-10 Teesta | 08:10 IST] IVRS & SMS dispatched to SDRF and Local Villages",
            "status": "DELIVERED_ACKNOWLEDGED"
        },
        {
            "id": "disp-005",
            "tier": "HIGH",
            "district": "Aizawl",
            "corridor": "NH-306",
            "location": "Sairang Hill Incline",
            "timestamp": "07:30 IST",
            "dialects": ["Mizo", "English"],
            "targets": ["Disaster Management Aizawl", "Young Mizo Association (YMA)"],
            "channels": ["SMS Gateway", "Local Radio"],
            "summary": "[HIGH | Aizawl | 07:30 IST] IVRS & SMS dispatched to SDRF and Local Villages",
            "status": "DELIVERED"
        }
    ]

    @classmethod
    def generate_dispatch_payload(
        cls,
        corridor_id: str,
        location: str,
        bypass_name: str,
        language: str = "en"
    ) -> Dict[str, Any]:
        dialect = cls.DIALECT_SCRIPTS.get(language, cls.DIALECT_SCRIPTS["en"])
        return {
            "language": language,
            "corridor": corridor_id,
            "title": dialect["critical_title"],
            "voice_script": dialect["message"].format(corridor=corridor_id, bypass=bypass_name, location=location),
            "sms_text": dialect["sms_template"].format(corridor=corridor_id, bypass=bypass_name, location=location),
            "dispatched": True
        }

    @classmethod
    def log_dispatch(
        cls,
        district: str,
        corridor: str,
        location: str,
        tier: str = "CRITICAL",
        dialects: List[str] = None
    ) -> Dict[str, Any]:
        import time
        from datetime import datetime
        now_str = datetime.now().strftime("%H:%M IST")
        new_id = f"disp-{int(time.time())}"
        langs = dialects or ["Assamese", "English"]
        entry = {
            "id": new_id,
            "tier": tier,
            "district": district,
            "corridor": corridor,
            "location": location,
            "timestamp": now_str,
            "dialects": langs,
            "targets": ["SDRF Regional Wing", "Local Villages & Panchayats", "District Disaster Management"],
            "channels": ["SIP IVRS Outbound", "SMS Gateway", "CAP-CP Common Alert"],
            "summary": f"[{tier} | {district} | {now_str}] IVRS & SMS dispatched to SDRF and Local Villages",
            "status": "DELIVERED_ACKNOWLEDGED"
        }
        cls.DISPATCH_HISTORY.insert(0, entry)
        return entry

    @classmethod
    def get_dispatch_history(cls) -> List[Dict[str, Any]]:
        return cls.DISPATCH_HISTORY

