package com.zaalima.medicnote.service;

import com.zaalima.medicnote.dto.MedicineDto;
import com.zaalima.medicnote.dto.PrescriptionRequest;
import com.zaalima.medicnote.dto.PrescriptionResponse;
import com.zaalima.medicnote.entity.Doctor;
import com.zaalima.medicnote.entity.Medicine;
import com.zaalima.medicnote.entity.Patient;
import com.zaalima.medicnote.entity.Prescription;
import com.zaalima.medicnote.exception.BadRequestException;
import com.zaalima.medicnote.exception.ResourceNotFoundException;
import com.zaalima.medicnote.repository.DoctorRepository;
import com.zaalima.medicnote.repository.PatientRepository;
import com.zaalima.medicnote.repository.PrescriptionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    public PrescriptionService(PrescriptionRepository prescriptionRepository,
                                DoctorRepository doctorRepository,
                                PatientRepository patientRepository) {
        this.prescriptionRepository = prescriptionRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
    }

    public PrescriptionResponse create(Long doctorId, PrescriptionRequest req) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        Patient patient = patientRepository.findById(req.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        Prescription prescription = new Prescription();
        prescription.setDoctor(doctor);
        prescription.setPatient(patient);
        prescription.setDiagnosis(req.getDiagnosis());
        prescription.setNotes(req.getNotes());

        for (MedicineDto m : req.getMedicines()) {
            Medicine medicine = new Medicine(m.getName(), m.getDosage(), m.getFrequency(), m.getDuration());
            prescription.addMedicine(medicine);
        }

        prescription = prescriptionRepository.save(prescription);
        return PrescriptionResponse.fromEntity(prescription);
    }

    public PrescriptionResponse update(Long doctorId, Long prescriptionId, PrescriptionRequest req) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found"));

        if (!prescription.getDoctor().getId().equals(doctorId)) {
            throw new BadRequestException("You can only edit prescriptions you created");
        }

        Patient patient = patientRepository.findById(req.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        prescription.setPatient(patient);
        prescription.setDiagnosis(req.getDiagnosis());
        prescription.setNotes(req.getNotes());
        prescription.getMedicines().clear();

        for (MedicineDto m : req.getMedicines()) {
            Medicine medicine = new Medicine(m.getName(), m.getDosage(), m.getFrequency(), m.getDuration());
            prescription.addMedicine(medicine);
        }

        prescription.setUpdatedAt(LocalDateTime.now());
        prescription = prescriptionRepository.save(prescription);
        return PrescriptionResponse.fromEntity(prescription);
    }

    public void delete(Long doctorId, Long prescriptionId) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found"));

        if (!prescription.getDoctor().getId().equals(doctorId)) {
            throw new BadRequestException("You can only delete prescriptions you created");
        }
        prescriptionRepository.delete(prescription);
    }

    public List<PrescriptionResponse> getByDoctor(Long doctorId) {
        return prescriptionRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId)
                .stream().map(PrescriptionResponse::fromEntity).collect(Collectors.toList());
    }

    public List<PrescriptionResponse> getByPatient(Long patientId) {
        return prescriptionRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream().map(PrescriptionResponse::fromEntity).collect(Collectors.toList());
    }

    public Prescription getEntityAndCheckAccess(Long prescriptionId, Long userId, String role) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found"));

        boolean isOwnerDoctor = "DOCTOR".equals(role) && prescription.getDoctor().getId().equals(userId);
        boolean isOwnerPatient = "PATIENT".equals(role) && prescription.getPatient().getId().equals(userId);

        if (!isOwnerDoctor && !isOwnerPatient) {
            throw new BadRequestException("You do not have access to this prescription");
        }
        return prescription;
    }

    public PrescriptionResponse getById(Long prescriptionId, Long userId, String role) {
        return PrescriptionResponse.fromEntity(getEntityAndCheckAccess(prescriptionId, userId, role));
    }
}
