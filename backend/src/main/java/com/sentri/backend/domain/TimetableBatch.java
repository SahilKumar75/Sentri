package com.sentri.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "timetable_batches")
public class TimetableBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    private String yearLabel;
    private String branchLabel;
    private String divisionLabel;
    private String semesterLabel;
    private String academicPatternLabel;
    private LocalDate effectiveFrom;
    private String venue;
    private String sourceImageName;
    private String sourceImageMimeType;
    private String sourceImageChecksum;
    private String sourceHint;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TimetableBatchStatus status = TimetableBatchStatus.PLACEHOLDER;

    private Double extractionConfidence;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String rawOcrText;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String sourceNotes;

    @OneToMany(mappedBy = "batch", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC, startTime ASC, id ASC")
    private List<TimetableEntry> entries = new ArrayList<>();

    public TimetableBatch() {
    }

    public Long getId() {
        return id;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public String getYearLabel() {
        return yearLabel;
    }

    public void setYearLabel(String yearLabel) {
        this.yearLabel = yearLabel;
    }

    public String getBranchLabel() {
        return branchLabel;
    }

    public void setBranchLabel(String branchLabel) {
        this.branchLabel = branchLabel;
    }

    public String getDivisionLabel() {
        return divisionLabel;
    }

    public void setDivisionLabel(String divisionLabel) {
        this.divisionLabel = divisionLabel;
    }

    public String getSemesterLabel() {
        return semesterLabel;
    }

    public void setSemesterLabel(String semesterLabel) {
        this.semesterLabel = semesterLabel;
    }

    public String getAcademicPatternLabel() {
        return academicPatternLabel;
    }

    public void setAcademicPatternLabel(String academicPatternLabel) {
        this.academicPatternLabel = academicPatternLabel;
    }

    public LocalDate getEffectiveFrom() {
        return effectiveFrom;
    }

    public void setEffectiveFrom(LocalDate effectiveFrom) {
        this.effectiveFrom = effectiveFrom;
    }

    public String getVenue() {
        return venue;
    }

    public void setVenue(String venue) {
        this.venue = venue;
    }

    public String getSourceImageName() {
        return sourceImageName;
    }

    public void setSourceImageName(String sourceImageName) {
        this.sourceImageName = sourceImageName;
    }

    public String getSourceImageMimeType() {
        return sourceImageMimeType;
    }

    public void setSourceImageMimeType(String sourceImageMimeType) {
        this.sourceImageMimeType = sourceImageMimeType;
    }

    public String getSourceImageChecksum() {
        return sourceImageChecksum;
    }

    public void setSourceImageChecksum(String sourceImageChecksum) {
        this.sourceImageChecksum = sourceImageChecksum;
    }

    public String getSourceHint() {
        return sourceHint;
    }

    public void setSourceHint(String sourceHint) {
        this.sourceHint = sourceHint;
    }

    public TimetableBatchStatus getStatus() {
        return status;
    }

    public void setStatus(TimetableBatchStatus status) {
        this.status = status;
    }

    public Double getExtractionConfidence() {
        return extractionConfidence;
    }

    public void setExtractionConfidence(Double extractionConfidence) {
        this.extractionConfidence = extractionConfidence;
    }

    public String getRawOcrText() {
        return rawOcrText;
    }

    public void setRawOcrText(String rawOcrText) {
        this.rawOcrText = rawOcrText;
    }

    public String getSourceNotes() {
        return sourceNotes;
    }

    public void setSourceNotes(String sourceNotes) {
        this.sourceNotes = sourceNotes;
    }

    public List<TimetableEntry> getEntries() {
        return entries;
    }

    public void replaceEntries(List<TimetableEntry> newEntries) {
        entries.clear();
        if (newEntries == null) {
            return;
        }
        for (TimetableEntry entry : newEntries) {
            entry.setBatch(this);
            entries.add(entry);
        }
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
