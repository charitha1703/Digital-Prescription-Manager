package com.zaalima.medicnote.service;

import com.zaalima.medicnote.dto.*;
import com.zaalima.medicnote.entity.Doctor;
import com.zaalima.medicnote.entity.Patient;
import com.zaalima.medicnote.exception.BadRequestException;
import com.zaalima.medicnote.repository.DoctorRepository;
import com.zaalima.medicnote.repository.PatientRepository;
import com.zaalima.medicnote.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(DoctorRepository doctorRepository,
                        PatientRepository patientRepository,
                        PasswordEncoder passwordEncoder,
                        JwtUtil jwtUtil) {
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public JwtResponse registerDoctor(RegisterDoctorRequest req) {
        if (doctorRepository.existsByEmail(req.getEmail())) {
            throw new BadRequestException("A doctor with this email already exists");
        }
        Doctor doctor = new Doctor(
                req.getName(),
                req.getEmail(),
                passwordEncoder.encode(req.getPassword()),
                req.getSpecialization(),
                req.getPhone()
        );
        doctor = doctorRepository.save(doctor);

        String token = jwtUtil.generateToken(doctor.getId(), doctor.getEmail(), "DOCTOR");
        return new JwtResponse(token, doctor.getId(), doctor.getName(), doctor.getEmail(), "DOCTOR");
    }

    public JwtResponse registerPatient(RegisterPatientRequest req) {
        if (patientRepository.existsByEmail(req.getEmail())) {
            throw new BadRequestException("A patient with this email already exists");
        }
        Patient patient = new Patient(
                req.getName(),
                req.getEmail(),
                passwordEncoder.encode(req.getPassword()),
                req.getPhone(),
                req.getAge(),
                req.getGender()
        );
        patient = patientRepository.save(patient);

        String token = jwtUtil.generateToken(patient.getId(), patient.getEmail(), "PATIENT");
        return new JwtResponse(token, patient.getId(), patient.getName(), patient.getEmail(), "PATIENT");
    }

    public JwtResponse login(LoginRequest req) {
        String role = req.getRole().trim().toUpperCase();

        if ("DOCTOR".equals(role)) {
            Doctor doctor = doctorRepository.findByEmail(req.getEmail())
                    .orElseThrow(() -> new BadRequestException("Invalid email or password"));
            if (!passwordEncoder.matches(req.getPassword(), doctor.getPassword())) {
                throw new BadRequestException("Invalid email or password");
            }
            String token = jwtUtil.generateToken(doctor.getId(), doctor.getEmail(), "DOCTOR");
            return new JwtResponse(token, doctor.getId(), doctor.getName(), doctor.getEmail(), "DOCTOR");

        } else if ("PATIENT".equals(role)) {
            Patient patient = patientRepository.findByEmail(req.getEmail())
                    .orElseThrow(() -> new BadRequestException("Invalid email or password"));
            if (!passwordEncoder.matches(req.getPassword(), patient.getPassword())) {
                throw new BadRequestException("Invalid email or password");
            }
            String token = jwtUtil.generateToken(patient.getId(), patient.getEmail(), "PATIENT");
            return new JwtResponse(token, patient.getId(), patient.getName(), patient.getEmail(), "PATIENT");
        }

        throw new BadRequestException("Role must be DOCTOR or PATIENT");
    }
}
