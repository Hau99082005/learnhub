package com.learnhub.backend.modules.cart.support;

import java.math.BigDecimal;

public final class CertificateGrades {
    public static final String KHONG_DAT = "KHONG_DAT";
    public static final String TRUNG_BINH = "TRUNG_BINH";
    public static final String KHA = "KHA";
    public static final String GIOI = "GIOI";
    public static final String XUAT_SAC = "XUAT_SAC";
    public static final BigDecimal PASS = BigDecimal.valueOf(50);

    private CertificateGrades() {
    }

    public static String of(BigDecimal percent) {
        BigDecimal value = percent == null ? BigDecimal.ZERO : percent;
        if (value.compareTo(BigDecimal.valueOf(90)) >= 0) {
            return XUAT_SAC;
        }
        if (value.compareTo(BigDecimal.valueOf(80)) >= 0) {
            return GIOI;
        }
        if (value.compareTo(BigDecimal.valueOf(65)) >= 0) {
            return KHA;
        }
        if (value.compareTo(PASS) >= 0) {
            return TRUNG_BINH;
        }
        return KHONG_DAT;
    }

    public static String label(String grade) {
        if (XUAT_SAC.equals(grade)) {
            return "Xuất sắc";
        }
        if (GIOI.equals(grade)) {
            return "Giỏi";
        }
        if (KHA.equals(grade)) {
            return "Khá";
        }
        if (TRUNG_BINH.equals(grade)) {
            return "Trung bình";
        }
        return "Không đạt";
    }

    public static boolean passed(BigDecimal percent) {
        return percent != null && percent.compareTo(PASS) >= 0;
    }
}
