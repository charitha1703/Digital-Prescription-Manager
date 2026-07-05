package com.zaalima.medicnote.repository;

import com.zaalima.medicnote.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByEmail(String email);
    boolean existsByEmail(String email);
    List<Patient> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String name, String email);
}
