package com.zaalima.medicnote.controller;

import com.zaalima.medicnote.dto.PrescriptionRequest;
import com.zaalima.medicnote.dto.PrescriptionResponse;
import com.zaalima.medicnote.entity.Prescription;
import com.zaalima.medicnote.exception.BadRequestException;
import com.zaalima.medicnote.service.PdfService;
import com.zaalima.medicnote.service.PrescriptionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;
    private final PdfService pdfService;

    public PrescriptionController(PrescriptionService prescriptionService, PdfService pdfService) {
        this.prescriptionService = prescriptionService;
        this.pdfService = pdfService;
    }

    private Long requireDoctor(HttpServletRequest request) {
        String role = (String) request.getAttribute("authUserRole");
        if (!"DOCTOR".equals(role)) {
            throw new BadRequestException("Only doctors can perform this action");
        }
        return (Long) request.getAttribute("authUserId");
    }

    @PostMapping
    public ResponseEntity<PrescriptionResponse> create(HttpServletRequest request,
                                                         @Valid @RequestBody PrescriptionRequest body) {
        Long doctorId = requireDoctor(request);
        return ResponseEntity.ok(prescriptionService.create(doctorId, body));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PrescriptionResponse> update(HttpServletRequest request,
                                                         @PathVariable Long id,
                                                         @Valid @RequestBody PrescriptionRequest body) {
        Long doctorId = requireDoctor(request);
        return ResponseEntity.ok(prescriptionService.update(doctorId, id, body));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(HttpServletRequest request, @PathVariable Long id) {
        Long doctorId = requireDoctor(request);
        prescriptionService.delete(doctorId, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/doctor")
    public ResponseEntity<List<PrescriptionResponse>> getForDoctor(HttpServletRequest request) {
        Long doctorId = requireDoctor(request);
        return ResponseEntity.ok(prescriptionService.getByDoctor(doctorId));
    }

    @GetMapping("/patient")
    public ResponseEntity<List<PrescriptionResponse>> getForPatient(HttpServletRequest request) {
        String role = (String) request.getAttribute("authUserRole");
        if (!"PATIENT".equals(role)) {
            throw new BadRequestException("Only patients can view this");
        }
        Long patientId = (Long) request.getAttribute("authUserId");
        return ResponseEntity.ok(prescriptionService.getByPatient(patientId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PrescriptionResponse> getById(HttpServletRequest request, @PathVariable Long id) {
        Long userId = (Long) request.getAttribute("authUserId");
        String role = (String) request.getAttribute("authUserRole");
        return ResponseEntity.ok(prescriptionService.getById(id, userId, role));
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(HttpServletRequest request, @PathVariable Long id) throws Exception {
        Long userId = (Long) request.getAttribute("authUserId");
        String role = (String) request.getAttribute("authUserRole");

        Prescription prescription = prescriptionService.getEntityAndCheckAccess(id, userId, role);
        byte[] pdfBytes = pdfService.generatePrescriptionPdf(prescription);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "prescription-" + id + ".pdf");

        return ResponseEntity.ok().headers(headers).body(pdfBytes);
    }
}
