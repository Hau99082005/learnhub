package com.learnhub.backend.modules.cart.services;

import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import com.learnhub.backend.modules.cart.models.Wishlist;
import com.learnhub.backend.modules.cart.repositories.WishlistRepository;
import com.learnhub.backend.modules.course.dtos.CourseAdminDTO;
import com.learnhub.backend.modules.course.services.CourseServices;
import com.learnhub.backend.modules.instructor.models.Course;
import com.learnhub.backend.modules.instructor.repositories.CourseRepository;
import com.learnhub.backend.modules.user.exceptions.AuthException;
import com.learnhub.backend.modules.user.models.user;
import com.learnhub.backend.modules.user.services.interfaces.UserServicesInterfaces;

@Service
public class WishlistService {
    private final UserServicesInterfaces userServices;
    private final WishlistRepository wishlists;
    private final CourseRepository courses;
    private final CourseServices courseServices;
    private final TransactionTemplate transactionTemplate;

    public WishlistService(
            UserServicesInterfaces userServices,
            WishlistRepository wishlists,
            CourseRepository courses,
            CourseServices courseServices,
            PlatformTransactionManager transactionManager) {
        this.userServices = userServices;
        this.wishlists = wishlists;
        this.courses = courses;
        this.courseServices = courseServices;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
        this.transactionTemplate.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    @Transactional(readOnly = true)
    public List<CourseAdminDTO> list(String authorization) {
        user account = userServices.requireAccount(authorization);
        return courseServices.findPublishedByIds(courseIds(account.getId()));
    }

    @Transactional
    public List<CourseAdminDTO> add(String authorization, Long courseId) {
        user account = userServices.requireAccount(authorization);
        Course course = requirePublished(courseId);
        persist(account.getId(), course.getId());
        return courseServices.findPublishedByIds(courseIds(account.getId()));
    }

    @Transactional
    public List<CourseAdminDTO> remove(String authorization, Long courseId) {
        user account = userServices.requireAccount(authorization);
        wishlists.deleteByUserIdAndCourseId(account.getId(), courseId);
        return courseServices.findPublishedByIds(courseIds(account.getId()));
    }

    private void persist(Long userId, Long courseId) {
        transactionTemplate.executeWithoutResult((status) -> {
            if (wishlists.existsByUserIdAndCourseId(userId, courseId)) {
                return;
            }
            try {
                Wishlist row = new Wishlist();
                row.setUserId(userId);
                row.setCourseId(courseId);
                wishlists.saveAndFlush(row);
            } catch (DataIntegrityViolationException ignored) {
                status.setRollbackOnly();
            }
        });
    }

    private List<Long> courseIds(Long userId) {
        return wishlists.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(Wishlist::getCourseId)
                .toList();
    }

    private Course requirePublished(Long courseId) {
        if (courseId == null) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Thiếu khóa học");
        }
        Course course = courses.findById(courseId)
                .orElseThrow(() -> new AuthException(HttpStatus.NOT_FOUND, "Không tìm thấy khóa học"));
        if (course.getDeletedAt() != null || !"PUBLISHED".equalsIgnoreCase(course.getStatus())) {
            throw new AuthException(HttpStatus.NOT_FOUND, "Không tìm thấy khóa học");
        }
        return course;
    }
}
