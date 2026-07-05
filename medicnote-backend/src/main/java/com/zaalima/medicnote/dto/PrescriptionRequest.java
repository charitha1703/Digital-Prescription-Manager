package com.zaalima.medicnote.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class PrescriptionRequest {

    @NotNull(message = "Patient id is required")
    private Long patientId;

    @NotBlank(message = "Diagnosis is required")
    private String diagnosis;

    private String notes;

    @NotEmpty(message = "At least one medicine is required")
    @Valid
    private List<MedicineDto> medicines;

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }

    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public List<MedicineDto> getMedicines() { return medicines; }
    public void setMedicines(List<MedicineDto> medicines) { this.medicines = medicines; }
}
