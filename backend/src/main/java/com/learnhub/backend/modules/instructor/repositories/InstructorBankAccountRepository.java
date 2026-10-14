package com.learnhub.backend.modules.instructor.repositories;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.learnhub.backend.modules.instructor.models.InstructorBankAccount;

public interface InstructorBankAccountRepository extends JpaRepository<InstructorBankAccount, Long> {
    Optional<InstructorBankAccount> findByUser_Id(Long userId);

    List<InstructorBankAccount> findByUser_IdIn(Collection<Long> userIds);
}
