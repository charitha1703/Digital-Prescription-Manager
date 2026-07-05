package com.zaalima.medicnote.controller;

import com.zaalima.medicnote.entity.Patient;
import com.zaalima.medicnote.repository.PatientRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientRepository patientRepository;

    public PatientController(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    // Used by doctors to search / pick a patient when writing a prescription
    @GetMapping("/search")
    public List<PatientSummary> search(@RequestParam(required = false, defaultValue = "") String query) {
        List<Patient> patients = query.isBlank()
                ? patientRepository.findAll()
                : patientRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query);

        return patients.stream()
                .map(p -> new PatientSummary(p.getId(), p.getName(), p.getEmail(), p.getPhone()))
                .collect(Collectors.toList());
    }

    // Simple DTO to avoid exposing password hash
    public record PatientSummary(Long id, String name, String email, String phone) {}
}
