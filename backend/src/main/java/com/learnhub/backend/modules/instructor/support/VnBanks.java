package com.learnhub.backend.modules.instructor.support;

import java.util.LinkedHashMap;
import java.util.Map;

public final class VnBanks {
    private static final Map<String, String> BANKS = new LinkedHashMap<>();
    private static final Map<String, String> SEPAY = new LinkedHashMap<>();

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
        SEPAY.put("MBBank", "MB");
        SEPAY.put("Vietcombank", "VCB");
        SEPAY.put("VietinBank", "ICB");
        SEPAY.put("BIDV", "BIDV");
        SEPAY.put("Agribank", "VBA");
        SEPAY.put("Techcombank", "TCB");
        SEPAY.put("ACB", "ACB");
        SEPAY.put("VPBank", "VPB");
        SEPAY.put("TPBank", "TPB");
        SEPAY.put("Sacombank", "STB");
        SEPAY.put("HDBank", "HDB");
        SEPAY.put("VIB", "VIB");
        SEPAY.put("SHB", "SHB");
        SEPAY.put("MSB", "MSB");
        SEPAY.put("OCB", "OCB");
        SEPAY.put("SeABank", "SEAB");
        SEPAY.put("Eximbank", "EIB");
        SEPAY.put("LPBank", "LPB");
        SEPAY.put("NamABank", "NAB");
        SEPAY.put("VietABank", "VAB");
        SEPAY.put("BacABank", "BAB");
        SEPAY.put("PVcomBank", "PVCB");
        SEPAY.put("NCB", "NCB");
        SEPAY.put("BaoVietBank", "BVB");
        SEPAY.put("ABBank", "ABB");
        SEPAY.put("VietBank", "VIETBANK");
        SEPAY.put("KienLongBank", "KLB");
        SEPAY.put("PGBank", "PGB");
        SEPAY.put("SaigonBank", "SGICB");
        SEPAY.put("BVBank", "BVBANK");
        SEPAY.put("Cake", "CAKE");
        SEPAY.put("Timo", "TIMO");
        SEPAY.put("Ubank", "UBANK");
        SEPAY.put("ShinhanBank", "SVB");
        SEPAY.put("Woori", "WVN");
        SEPAY.put("CIMB", "CIMB");
        SEPAY.put("HSBC", "HSBC");
        SEPAY.put("PublicBank", "PBVN");
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

    public static String sepayShortName(String code) {
        if (code == null || code.isBlank()) {
            return "";
        }
        return SEPAY.getOrDefault(code.trim(), code.trim());
    }
}
