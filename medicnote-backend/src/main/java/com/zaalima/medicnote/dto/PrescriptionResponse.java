package com.zaalima.medicnote.dto;

import com.zaalima.medicnote.entity.Medicine;
import com.zaalima.medicnote.entity.Prescription;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class PrescriptionResponse {

    private Long id;
    private String diagnosis;
    private String notes;
    private LocalDateTime createdAt;

    private Long doctorId;
    private String doctorName;
    private String doctorSpecialization;

    private Long patientId;
    private String patientName;
    private String patientEmail;

    private List<MedicineDto> medicines;

    public static PrescriptionResponse fromEntity(Prescription p) {
        PrescriptionResponse res = new PrescriptionResponse();
        res.id = p.getId();
        res.diagnosis = p.getDiagnosis();
        res.notes = p.getNotes();
        res.createdAt = p.getCreatedAt();

        res.doctorId = p.getDoctor().getId();
        res.doctorName = p.getDoctor().getName();
        res.doctorSpecialization = p.getDoctor().getSpecialization();

        res.patientId = p.getPatient().getId();
        res.patientName = p.getPatient().getName();
        res.patientEmail = p.getPatient().getEmail();

        res.medicines = p.getMedicines().stream().map(m -> {
            MedicineDto dto = new MedicineDto();
            dto.setName(m.getName());
            dto.setDosage(m.getDosage());
            dto.setFrequency(m.getFrequency());
            dto.setDuration(m.getDuration());
            return dto;
        }).collect(Collectors.toList());

        return res;
    }

    public Long getId() { return id; }
    public String getDiagnosis() { return diagnosis; }
    public String getNotes() { return notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public Long getDoctorId() { return doctorId; }
    public String getDoctorName() { return doctorName; }
    public String getDoctorSpecialization() { return doctorSpecialization; }
    public Long getPatientId() { return patientId; }
    public String getPatientName() { return patientName; }
    public String getPatientEmail() { return patientEmail; }
    public List<MedicineDto> getMedicines() { return medicines; }
}
