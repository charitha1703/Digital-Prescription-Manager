package com.zaalima.medicnote.dto;

import jakarta.validation.constraints.NotBlank;

public class MedicineDto {

    @NotBlank(message = "Medicine name is required")
    private String name;

    private String dosage;
    private String frequency;
    private String duration;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDosage() { return dosage; }
    public void setDosage(String dosage) { this.dosage = dosage; }

    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }
}
