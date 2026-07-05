package com.zaalima.medicnote.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.zaalima.medicnote.entity.Medicine;
import com.zaalima.medicnote.entity.Prescription;
import org.springframework.stereotype.Service;
import com.lowagie.text.pdf.draw.LineSeparator;
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class PdfService {

    private static final Font TITLE_FONT = new Font(Font.HELVETICA, 20, Font.BOLD, new Color(30, 64, 175));
    private static final Font SUB_FONT = new Font(Font.HELVETICA, 10, Font.NORMAL, Color.DARK_GRAY);
    private static final Font SECTION_FONT = new Font(Font.HELVETICA, 12, Font.BOLD, new Color(30, 64, 175));
    private static final Font LABEL_FONT = new Font(Font.HELVETICA, 10, Font.BOLD, Color.BLACK);
    private static final Font VALUE_FONT = new Font(Font.HELVETICA, 10, Font.NORMAL, Color.BLACK);
    private static final Font TABLE_HEADER_FONT = new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE);

    public byte[] generatePrescriptionPdf(Prescription prescription) throws DocumentException {
        Document document = new Document(PageSize.A4, 40, 40, 40, 40);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, out);
        document.open();

        // Header
        Paragraph title = new Paragraph("MedicNote", TITLE_FONT);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        Paragraph subtitle = new Paragraph("Digital Prescription", SUB_FONT);
        subtitle.setAlignment(Element.ALIGN_CENTER);
        subtitle.setSpacingAfter(15);
        document.add(subtitle);

        LineSeparator separator = new LineSeparator();
        document.add(new Chunk(separator));
        document.add(Chunk.NEWLINE);

        // Doctor & Patient info table
        PdfPTable infoTable = new PdfPTable(2);
        infoTable.setWidthPercentage(100);
        infoTable.setSpacingAfter(15);

        infoTable.addCell(borderlessCell("Doctor: " + prescription.getDoctor().getName(), LABEL_FONT));
        infoTable.addCell(borderlessCell("Patient: " + prescription.getPatient().getName(), LABEL_FONT));

        String specialization = prescription.getDoctor().getSpecialization();
        infoTable.addCell(borderlessCell(
                "Specialization: " + (specialization != null ? specialization : "General Physician"), VALUE_FONT));
        infoTable.addCell(borderlessCell("Patient Email: " + prescription.getPatient().getEmail(), VALUE_FONT));

        String date = prescription.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"));
        infoTable.addCell(borderlessCell("Date: " + date, VALUE_FONT));
        infoTable.addCell(borderlessCell("Prescription ID: #" + prescription.getId(), VALUE_FONT));

        document.add(infoTable);

        // Diagnosis
        Paragraph diagHeader = new Paragraph("Diagnosis", SECTION_FONT);
        diagHeader.setSpacingBefore(10);
        document.add(diagHeader);
        document.add(new Paragraph(prescription.getDiagnosis(), VALUE_FONT));

        // Medicines table
        Paragraph medHeader = new Paragraph("Prescribed Medicines", SECTION_FONT);
        medHeader.setSpacingBefore(15);
        document.add(medHeader);

        PdfPTable medTable = new PdfPTable(4);
        medTable.setWidthPercentage(100);
        medTable.setSpacingBefore(8);
        medTable.setWidths(new float[]{3, 2, 2.5f, 2});

        addHeaderCell(medTable, "Medicine");
        addHeaderCell(medTable, "Dosage");
        addHeaderCell(medTable, "Frequency");
        addHeaderCell(medTable, "Duration");

        for (Medicine m : prescription.getMedicines()) {
            medTable.addCell(dataCell(m.getName()));
            medTable.addCell(dataCell(m.getDosage() != null ? m.getDosage() : "-"));
            medTable.addCell(dataCell(m.getFrequency() != null ? m.getFrequency() : "-"));
            medTable.addCell(dataCell(m.getDuration() != null ? m.getDuration() : "-"));
        }
        document.add(medTable);

        // Notes
        if (prescription.getNotes() != null && !prescription.getNotes().isBlank()) {
            Paragraph notesHeader = new Paragraph("Additional Notes", SECTION_FONT);
            notesHeader.setSpacingBefore(15);
            document.add(notesHeader);
            document.add(new Paragraph(prescription.getNotes(), VALUE_FONT));
        }

        // Footer
        Paragraph footer = new Paragraph(
                "\n\nThis is a digitally generated prescription issued via MedicNote.", SUB_FONT);
        footer.setSpacingBefore(30);
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);

        document.close();
        return out.toByteArray();
    }

    private PdfPCell borderlessCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPaddingBottom(5);
        return cell;
    }

    private void addHeaderCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, TABLE_HEADER_FONT));
        cell.setBackgroundColor(new Color(30, 64, 175));
        cell.setPadding(6);
        table.addCell(cell);
    }

    private PdfPCell dataCell(String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, VALUE_FONT));
        cell.setPadding(6);
        return cell;
    }
}
