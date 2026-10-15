package com.learnhub.backend.modules.cart.repositories;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.learnhub.backend.modules.cart.models.Certificate;

public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    Optional<Certificate> findByEnrollmentId(Long enrollmentId);

    List<Certificate> findByEnrollmentIdIn(Collection<Long> enrollmentIds);

    Optional<Certificate> findByCertificateCode(String certificateCode);

    boolean existsByCertificateCode(String certificateCode);
}
