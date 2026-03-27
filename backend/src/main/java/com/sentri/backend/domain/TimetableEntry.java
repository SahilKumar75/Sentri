package com.sentri.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalTime;

@Entity
@Table(
        name = "timetable_entries",
        indexes = {
                @Index(name = "idx_timetable_entries_batch_id", columnList = "batch_id"),
                @Index(name = "idx_timetable_entries_batch_day_sort", columnList = "batch_id, dayOfWeek, sortOrder")
        }
)
public class TimetableEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    private TimetableBatch batch;

    @Column(nullable = false)
    private String dayOfWeek;

    private LocalTime startTime;
    private LocalTime endTime;
    private String subjectName;
    private String facultyCode;
    private String locationLabel;
    private String entryType;

    @Column(nullable = false)
    private Boolean breakEntry = Boolean.FALSE;

    @Column(nullable = false)
    private Boolean holidayEntry = Boolean.FALSE;

    @Column(nullable = false)
    private Integer sortOrder = 0;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String noteText;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String rawCellText;

    public TimetableEntry() {
    }

    public Long getId() {
        return id;
    }

    public TimetableBatch getBatch() {
        return batch;
    }

    public void setBatch(TimetableBatch batch) {
        this.batch = batch;
    }

    public String getDayOfWeek() {
        return dayOfWeek;
    }

    public void setDayOfWeek(String dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public String getSubjectName() {
        return subjectName;
    }

    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }

    public String getFacultyCode() {
        return facultyCode;
    }

    public void setFacultyCode(String facultyCode) {
        this.facultyCode = facultyCode;
    }

    public String getLocationLabel() {
        return locationLabel;
    }

    public void setLocationLabel(String locationLabel) {
        this.locationLabel = locationLabel;
    }

    public String getEntryType() {
        return entryType;
    }

    public void setEntryType(String entryType) {
        this.entryType = entryType;
    }

    public Boolean getBreakEntry() {
        return breakEntry;
    }

    public void setBreakEntry(Boolean breakEntry) {
        this.breakEntry = breakEntry;
    }

    public Boolean getHolidayEntry() {
        return holidayEntry;
    }

    public void setHolidayEntry(Boolean holidayEntry) {
        this.holidayEntry = holidayEntry;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public String getNoteText() {
        return noteText;
    }

    public void setNoteText(String noteText) {
        this.noteText = noteText;
    }

    public String getRawCellText() {
        return rawCellText;
    }

    public void setRawCellText(String rawCellText) {
        this.rawCellText = rawCellText;
    }

    @PrePersist
    void onCreate() {
        if (breakEntry == null) {
            breakEntry = Boolean.FALSE;
        }
        if (holidayEntry == null) {
            holidayEntry = Boolean.FALSE;
        }
        if (sortOrder == null) {
            sortOrder = 0;
        }
    }
}
