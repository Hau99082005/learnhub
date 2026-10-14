package com.learnhub.backend.modules.instructor.support;

import java.util.LinkedHashMap;
import java.util.Map;

public final class VnBanks {
    private static final Map<String, String> BANKS = new LinkedHashMap<>();

    static {
        BANKS.put("MBBank", "MB Bank");
        BANKS.put("Vietcombank", "Vietcombank");
        BANKS.put("VietinBank", "VietinBank");
        BANKS.put("BIDV", "BIDV");
        BANKS.put("Agribank", "Agribank");
        BANKS.put("Techcombank", "Techcombank");
        BANKS.put("ACB", "ACB");
        BANKS.put("VPBank", "VPBank");
        BANKS.put("TPBank", "TPBank");
        BANKS.put("Sacombank", "Sacombank");
        BANKS.put("HDBank", "HDBank");
        BANKS.put("VIB", "VIB");
        BANKS.put("SHB", "SHB");
        BANKS.put("MSB", "MSB");
        BANKS.put("OCB", "OCB");
        BANKS.put("SeABank", "SeABank");
        BANKS.put("Eximbank", "Eximbank");
        BANKS.put("LPBank", "LPBank");
        BANKS.put("NamABank", "Nam A Bank");
        BANKS.put("VietABank", "VietABank");
        BANKS.put("BacABank", "Bac A Bank");
        BANKS.put("PVcomBank", "PVcomBank");
        BANKS.put("NCB", "NCB");
        BANKS.put("BaoVietBank", "BaoViet Bank");
        BANKS.put("ABBank", "ABBank");
        BANKS.put("VietBank", "VietBank");
        BANKS.put("KienLongBank", "KienlongBank");
        BANKS.put("PGBank", "PGBank");
        BANKS.put("SaigonBank", "SaigonBank");
        BANKS.put("BVBank", "BVBank");
        BANKS.put("Cake", "CAKE");
        BANKS.put("Timo", "Timo");
        BANKS.put("Ubank", "Ubank");
        BANKS.put("ShinhanBank", "Shinhan Bank");
        BANKS.put("Woori", "Woori Bank");
        BANKS.put("CIMB", "CIMB");
        BANKS.put("HSBC", "HSBC");
        BANKS.put("PublicBank", "Public Bank");
    }

    private VnBanks() {
    }

    public static Map<String, String> all() {
        return BANKS;
    }

    public static boolean known(String code) {
        return code != null && BANKS.containsKey(code);
    }

    public static String nameOf(String code) {
        if (code == null) {
            return "";
        }
        return BANKS.getOrDefault(code, code);
    }
}
