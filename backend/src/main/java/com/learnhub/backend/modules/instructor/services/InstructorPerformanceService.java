package com.learnhub.backend.modules.instructor.services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.BiFunction;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.learnhub.backend.modules.cart.models.Enrollment;
import com.learnhub.backend.modules.cart.models.OrderItem;
import com.learnhub.backend.modules.cart.repositories.EnrollmentRepository;
import com.learnhub.backend.modules.cart.repositories.OrderItemRepository;
import com.learnhub.backend.modules.instructor.dtos.InstructorPerformanceDTO;
import com.learnhub.backend.modules.instructor.dtos.PerformanceCourseDTO;
import com.learnhub.backend.modules.instructor.dtos.PerformanceTrendDTO;
import com.learnhub.backend.modules.instructor.models.Course;
import com.learnhub.backend.modules.instructor.repositories.CourseRepository;
import com.learnhub.backend.modules.user.dtos.DashboardCardDTO;
import com.learnhub.backend.modules.user.dtos.userDTO;
import com.learnhub.backend.modules.user.services.interfaces.UserServicesInterfaces;

@Service
public class InstructorPerformanceService {
    private final UserServicesInterfaces userServices;
    private final CourseRepository courses;
    private final EnrollmentRepository enrollments;
    private final OrderItemRepository orderItems;

    public InstructorPerformanceService(
            UserServicesInterfaces userServices,
            CourseRepository courses,
            EnrollmentRepository enrollments,
            OrderItemRepository orderItems) {
        this.userServices = userServices;
        this.courses = courses;
        this.enrollments = enrollments;
        this.orderItems = orderItems;
    }

    @Transactional(readOnly = true)
    public InstructorPerformanceDTO stats(String authorization) {
        userDTO actor = userServices.requireInstructor(authorization);
        List<Course> rows = courses.findByInstructorIdAndDeletedAtIsNullOrderByCreatedAtDesc(actor.getId());
        List<Long> ids = rows.stream().map(Course::getId).toList();
        LocalDate thisMonth = LocalDate.now().withDayOfMonth(1);
        LocalDate lastMonth = thisMonth.minusMonths(1);
        LocalDate nextMonth = thisMonth.plusMonths(1);
        long students = ids.isEmpty() ? 0 : enrollments.countByCourseIdIn(ids);
        long studentsPrev = ids.isEmpty()
                ? 0
                : enrollments.countByCourseIdInAndEnrolledBetween(ids, lastMonth.atStartOfDay(), thisMonth.atStartOfDay());
        long studentsNow = ids.isEmpty()
                ? 0
                : enrollments.countByCourseIdInAndEnrolledBetween(ids, thisMonth.atStartOfDay(), nextMonth.atStartOfDay());
        BigDecimal revenue = ids.isEmpty() ? BigDecimal.ZERO : nvl(orderItems.sumPaidByCourseIds(ids));
        BigDecimal revenuePrev = ids.isEmpty()
                ? BigDecimal.ZERO
                : nvl(orderItems.sumPaidByCourseIdsBetween(ids, lastMonth.atStartOfDay(), thisMonth.atStartOfDay()));
        BigDecimal revenueNow = ids.isEmpty()
                ? BigDecimal.ZERO
                : nvl(orderItems.sumPaidByCourseIdsBetween(ids, thisMonth.atStartOfDay(), nextMonth.atStartOfDay()));
        long published = rows.stream().filter(item -> "PUBLISHED".equalsIgnoreCase(item.getStatus())).count();
        BigDecimal rating = ratingOf(rows);
        long ratingCount = rows.stream().mapToLong(item -> nvl(item.getRatingCount())).sum();

        List<DashboardCardDTO> cards = new ArrayList<>();
        cards.add(card("students", "Học viên", students, studentsPrev, studentsNow, (start, end) ->
                ids.isEmpty() ? 0L : enrollments.countByCourseIdInAndEnrolledBetween(ids, start, end)));
        cards.add(card("revenue", "Doanh thu", revenue.longValue(), revenuePrev.longValue(), revenueNow.longValue(), (start, end) ->
                ids.isEmpty() ? 0L : nvl(orderItems.sumPaidByCourseIdsBetween(ids, start, end)).longValue()));
        cards.add(card("rating", "Đánh giá", Math.round(rating.doubleValue() * 10), 0, 0, (start, end) -> 0L));
        cards.add(card("courses", "Khóa học", rows.size(), 0, published, (start, end) -> 0L));

        DateTimeFormatter day = DateTimeFormatter.ofPattern("d/M/yyyy");
        LocalDate start = LocalDate.now().withDayOfMonth(1).minusMonths(6);
        LocalDate last = LocalDate.now().withDayOfMonth(1).plusMonths(1).minusDays(1);
        return new InstructorPerformanceDTO(
                List.copyOf(cards),
                trend(ids),
                courseRows(rows, ids, actor.getId()),
                rating,
                ratingCount,
                start.format(day),
                last.format(day));
    }

    private List<PerformanceTrendDTO> trend(List<Long> ids) {
        DateTimeFormatter label = DateTimeFormatter.ofPattern("M/yyyy");
        LocalDate cursor = LocalDate.now().withDayOfMonth(1).minusMonths(6);
        List<PerformanceTrendDTO> points = new ArrayList<>();
        for (int index = 0; index < 7; index++) {
            LocalDate next = cursor.plusMonths(1);
            long students = ids.isEmpty()
                    ? 0
                    : enrollments.countByCourseIdInAndEnrolledBetween(ids, cursor.atStartOfDay(), next.atStartOfDay());
            long revenue = ids.isEmpty()
                    ? 0
                    : nvl(orderItems.sumPaidByCourseIdsBetween(ids, cursor.atStartOfDay(), next.atStartOfDay())).longValue();
            points.add(new PerformanceTrendDTO(cursor.format(label), students, revenue));
            cursor = next;
        }
        return List.copyOf(points);
    }

    private List<PerformanceCourseDTO> courseRows(List<Course> rows, List<Long> ids, Long instructorId) {
        if (rows.isEmpty()) {
            return List.of();
        }
        Map<Long, List<Enrollment>> byCourse = new HashMap<>();
        for (Enrollment row : enrollments.findByCourseIdIn(ids)) {
            byCourse.computeIfAbsent(row.getCourseId(), key -> new ArrayList<>()).add(row);
        }
        Map<Long, BigDecimal> revenue = new HashMap<>();
        for (OrderItem item : orderItems.findPaidByInstructor(instructorId)) {
            Long courseId = item.getCourse() == null ? null : item.getCourse().getId();
            if (courseId == null) {
                continue;
            }
            revenue.merge(courseId, nvl(item.getUnitPrice()), BigDecimal::add);
        }
        List<PerformanceCourseDTO> list = new ArrayList<>();
        for (Course course : rows) {
            List<Enrollment> people = byCourse.getOrDefault(course.getId(), List.of());
            BigDecimal progress = BigDecimal.ZERO;
            if (!people.isEmpty()) {
                BigDecimal total = people.stream()
                        .map(item -> nvl(item.getProgressPercent()))
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                progress = total.divide(BigDecimal.valueOf(people.size()), 1, RoundingMode.HALF_UP);
            }
            list.add(new PerformanceCourseDTO(
                    course.getId(),
                    course.getTitle(),
                    course.getImages(),
                    course.getStatus(),
                    people.size(),
                    nvl(course.getRatingAvg()),
                    nvl(course.getRatingCount()),
                    revenue.getOrDefault(course.getId(), BigDecimal.ZERO),
                    progress));
        }
        return List.copyOf(list);
    }

    private DashboardCardDTO card(
            String key,
            String label,
            long total,
            long previous,
            long current,
            BiFunction<LocalDateTime, LocalDateTime, Long> monthly) {
        double delta = previous == 0
                ? (current > 0 ? 100d : 0d)
                : ((current - previous) * 100d / previous);
        return new DashboardCardDTO(
                key,
                label,
                total,
                String.format(Locale.US, "%.1f%%", Math.abs(delta)),
                delta >= 0,
                series(monthly));
    }

    private List<Long> series(BiFunction<LocalDateTime, LocalDateTime, Long> monthly) {
        LocalDate cursor = LocalDate.now().withDayOfMonth(1).minusMonths(5);
        List<Long> points = new ArrayList<>();
        for (int index = 0; index < 6; index++) {
            LocalDate next = cursor.plusMonths(1);
            points.add(monthly.apply(cursor.atStartOfDay(), next.atStartOfDay()));
            cursor = next;
        }
        return List.copyOf(points);
    }

    private BigDecimal ratingOf(List<Course> rows) {
        long count = 0;
        BigDecimal sum = BigDecimal.ZERO;
        for (Course course : rows) {
            long votes = nvl(course.getRatingCount());
            if (votes <= 0) {
                continue;
            }
            count += votes;
            sum = sum.add(nvl(course.getRatingAvg()).multiply(BigDecimal.valueOf(votes)));
        }
        if (count == 0) {
            return BigDecimal.ZERO.setScale(1, RoundingMode.HALF_UP);
        }
        return sum.divide(BigDecimal.valueOf(count), 1, RoundingMode.HALF_UP);
    }

    private BigDecimal nvl(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private long nvl(Integer value) {
        return value == null ? 0 : value;
    }
}
