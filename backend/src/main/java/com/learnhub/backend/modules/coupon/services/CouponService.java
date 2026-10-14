package com.learnhub.backend.modules.coupon.services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.learnhub.backend.modules.cart.models.Cart;
import com.learnhub.backend.modules.cart.models.CartItem;
import com.learnhub.backend.modules.cart.models.ShopOrder;
import com.learnhub.backend.modules.cart.repositories.CartItemRepository;
import com.learnhub.backend.modules.cart.repositories.CartRepository;
import com.learnhub.backend.modules.coupon.dtos.CouponQuoteDTO;
import com.learnhub.backend.modules.coupon.models.Coupon;
import com.learnhub.backend.modules.coupon.models.CouponUsage;
import com.learnhub.backend.modules.coupon.repositories.CouponRepository;
import com.learnhub.backend.modules.coupon.repositories.CouponUsageRepository;
import com.learnhub.backend.modules.user.exceptions.AuthException;
import com.learnhub.backend.modules.user.models.user;
import com.learnhub.backend.modules.user.services.interfaces.UserServicesInterfaces;

@Service
public class CouponService {
    private final CouponRepository coupons;
    private final CouponUsageRepository usages;
    private final CartRepository carts;
    private final CartItemRepository cartItems;
    private final UserServicesInterfaces userServices;

    public CouponService(
            CouponRepository coupons,
            CouponUsageRepository usages,
            CartRepository carts,
            CartItemRepository cartItems,
            UserServicesInterfaces userServices) {
        this.coupons = coupons;
        this.usages = usages;
        this.carts = carts;
        this.cartItems = cartItems;
        this.userServices = userServices;
    }

    @Transactional(readOnly = true)
    public List<CouponQuoteDTO> listActive(String authorization) {
        user account = userServices.requireAccount(authorization);
        Cart cart = carts.findByUserIdAndStatus(account.getId(), "ACTIVE").orElse(null);
        List<CartItem> rows = cart == null ? List.of() : cartItems.findByCartIdWithCourse(cart.getId());
        return coupons.findActiveAt(LocalDateTime.now()).stream()
                .map((coupon) -> quoteOrNull(coupon, account.getId(), rows))
                .filter((row) -> row != null)
                .toList();
    }

    @Transactional(readOnly = true)
    public CouponQuoteDTO preview(String authorization, String code) {
        user account = userServices.requireAccount(authorization);
        Cart cart = carts.findByUserIdAndStatus(account.getId(), "ACTIVE")
                .orElseThrow(() -> new AuthException(HttpStatus.BAD_REQUEST, "Giỏ hàng của bạn đang trống"));
        List<CartItem> rows = cartItems.findByCartIdWithCourse(cart.getId());
        if (rows.isEmpty()) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Giỏ hàng của bạn đang trống");
        }
        return quote(requireCoupon(code), account.getId(), rows);
    }

    @Transactional
    public CouponQuoteDTO applyToOrder(ShopOrder order, Long userId, String code, List<CartItem> rows) {
        CouponQuoteDTO quote = quote(requireCoupon(code), userId, rows);
        Coupon coupon = coupons.findById(quote.getId())
                .orElseThrow(() -> new AuthException(HttpStatus.NOT_FOUND, "Mã giảm giá không tồn tại"));
        order.setCoupon(coupon);
        order.setDiscountAmount(quote.getDiscountAmount());
        order.setTotalAmount(quote.getTotalAmount());
        if (!usages.existsByCouponIdAndOrderId(coupon.getId(), order.getId())) {
            CouponUsage usage = new CouponUsage();
            usage.setCouponId(coupon.getId());
            usage.setUserId(userId);
            usage.setOrderId(order.getId());
            usages.save(usage);
            coupon.setUsedCount((coupon.getUsedCount() == null ? 0 : coupon.getUsedCount()) + 1);
            coupons.save(coupon);
        }
        return quote;
    }

    public Coupon requireCoupon(String raw) {
        String code = raw == null ? "" : raw.trim().toUpperCase(Locale.ROOT);
        if (code.isBlank()) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Vui lòng nhập mã giảm giá");
        }
        return coupons.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new AuthException(HttpStatus.NOT_FOUND, "Mã giảm giá không tồn tại"));
    }

    private CouponQuoteDTO quoteOrNull(Coupon coupon, Long userId, List<CartItem> rows) {
        try {
            return quote(coupon, userId, rows);
        } catch (AuthException ignored) {
            return null;
        }
    }

    private CouponQuoteDTO quote(Coupon coupon, Long userId, List<CartItem> rows) {
        LocalDateTime now = LocalDateTime.now();
        if (!"ACTIVE".equalsIgnoreCase(coupon.getStatus())) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Mã giảm giá không còn hiệu lực");
        }
        if (coupon.getStartsAt() != null && now.isBefore(coupon.getStartsAt())) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Mã giảm giá chưa đến thời gian áp dụng");
        }
        if (coupon.getExpiresAt() != null && now.isAfter(coupon.getExpiresAt())) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Mã giảm giá đã hết hạn");
        }
        int maxUses = coupon.getMaxUses() == null ? 0 : coupon.getMaxUses();
        int used = coupon.getUsedCount() == null ? 0 : coupon.getUsedCount();
        if (maxUses > 0 && used >= maxUses) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Mã giảm giá đã hết lượt sử dụng");
        }
        if (usages.existsByCouponIdAndUserId(coupon.getId(), userId)) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Bạn đã dùng mã giảm giá này");
        }
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal eligible = BigDecimal.ZERO;
        String currency = "VND";
        Set<Long> allowed = new HashSet<>(coupons.findCourseIds(coupon.getId()));
        boolean restricted = !allowed.isEmpty();
        for (CartItem row : rows) {
            BigDecimal price = row.getUnitPrice() == null ? BigDecimal.ZERO : row.getUnitPrice();
            subtotal = subtotal.add(price);
            if (row.getCourse() != null && row.getCourse().getCurrency() != null) {
                currency = row.getCourse().getCurrency();
            }
            Long courseId = row.getCourse() == null ? null : row.getCourse().getId();
            if (!restricted || (courseId != null && allowed.contains(courseId))) {
                eligible = eligible.add(price);
            }
        }
        if (restricted && eligible.compareTo(BigDecimal.ZERO) <= 0) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Mã không áp dụng cho khóa học trong giỏ");
        }
        BigDecimal min = coupon.getMinOrderAmount() == null ? BigDecimal.ZERO : coupon.getMinOrderAmount();
        if (subtotal.compareTo(min) < 0) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Đơn hàng chưa đạt giá trị tối thiểu của mã");
        }
        BigDecimal discount = computeDiscount(coupon, eligible);
        if (discount.compareTo(subtotal) > 0) {
            discount = subtotal;
        }
        BigDecimal total = subtotal.subtract(discount);
        if (total.compareTo(BigDecimal.ZERO) < 0) {
            total = BigDecimal.ZERO;
        }
        return new CouponQuoteDTO(
                coupon.getId(),
                coupon.getCode(),
                coupon.getDiscountType(),
                coupon.getDiscountValue(),
                subtotal,
                discount,
                total,
                currency,
                coupon.getExpiresAt());
    }

    private BigDecimal computeDiscount(Coupon coupon, BigDecimal eligible) {
        BigDecimal value = coupon.getDiscountValue() == null ? BigDecimal.ZERO : coupon.getDiscountValue();
        if ("PERCENT".equalsIgnoreCase(coupon.getDiscountType())) {
            return eligible.multiply(value).divide(BigDecimal.valueOf(100), 0, RoundingMode.DOWN);
        }
        return value.min(eligible).setScale(0, RoundingMode.DOWN);
    }
}
