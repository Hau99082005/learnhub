package com.learnhub.backend.modules.instructor.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.learnhub.backend.modules.instructor.models.InstructorSupportTicket;

public interface InstructorSupportTicketRepository extends JpaRepository<InstructorSupportTicket, Long> {
    List<InstructorSupportTicket> findByUser_IdOrderByCreatedAtDesc(Long userId);

    Optional<InstructorSupportTicket> findByIdAndUser_Id(Long id, Long userId);
}
