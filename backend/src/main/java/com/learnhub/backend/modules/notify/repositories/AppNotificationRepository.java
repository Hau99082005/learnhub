package com.learnhub.backend.modules.notify.repositories;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.learnhub.backend.modules.notify.models.AppNotification;

public interface AppNotificationRepository extends JpaRepository<AppNotification, Long> {
    List<AppNotification> findByUserIdOrderByCreatedAtDesc(Long userId);

    long countByUserIdAndIsReadFalse(Long userId);

    boolean existsByUserIdAndTypeAndReferenceId(Long userId, String type, Long referenceId);

    @Modifying
    @Transactional
    @Query("update AppNotification n set n.isRead = true, n.readAt = :now where n.userId = :userId and n.isRead = false")
    int markAllRead(@Param("userId") Long userId, @Param("now") LocalDateTime now);
}
