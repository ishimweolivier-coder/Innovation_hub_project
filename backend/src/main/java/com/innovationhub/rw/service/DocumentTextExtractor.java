package com.innovationhub.rw.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

@Component
public class DocumentTextExtractor {

    public String extract(Path file) throws IOException {
        if (file == null || !Files.exists(file)) return "";

        String name = file.getFileName().toString().toLowerCase();
        if (name.endsWith(".pdf")) {
            return extractPdf(file);
        }
        if (name.endsWith(".docx")) {
            return extractDocx(file);
        }
        if (name.endsWith(".html") || name.endsWith(".htm")) {
            return stripHtml(Files.readString(file, StandardCharsets.UTF_8));
        }
        if (name.endsWith(".txt")) {
            return Files.readString(file, StandardCharsets.UTF_8);
        }
        return "";
    }

    public String truncate(String text, int maxChars) {
        if (text == null || text.isBlank()) return "";
        String cleaned = text.replaceAll("\\s+", " ").trim();
        if (cleaned.length() <= maxChars) return cleaned;
        return cleaned.substring(0, maxChars) + "... [truncated]";
    }

    private String extractPdf(Path file) throws IOException {
        try (PDDocument document = Loader.loadPDF(file.toFile())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    private String extractDocx(Path file) throws IOException {
        try (InputStream in = Files.newInputStream(file);
             XWPFDocument document = new XWPFDocument(in)) {
            StringBuilder sb = new StringBuilder();
            document.getParagraphs().forEach(p -> sb.append(p.getText()).append('\n'));
            return sb.toString();
        }
    }

    private String stripHtml(String html) {
        return html.replaceAll("(?s)<style.*?>.*?</style>", " ")
                .replaceAll("(?s)<script.*?>.*?</script>", " ")
                .replaceAll("<[^>]+>", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }
}
