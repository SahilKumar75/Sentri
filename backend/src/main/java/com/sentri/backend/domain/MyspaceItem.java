package com.sentri.backend.domain;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "myspace_items",
        indexes = {
                @Index(name = "idx_myspace_items_subject", columnList = "subject"),
                @Index(name = "idx_myspace_items_updated_at", columnList = "updatedAt")
        }
)
public class MyspaceItem {

    @Id
    @Column(nullable = false, length = 120)
    private String id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @Column(nullable = false, length = 80)
    private String subject;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "myspace_item_tags", joinColumns = @JoinColumn(name = "item_id"))
    @OrderColumn(name = "tag_index")
    @Column(name = "tag_value", nullable = false, length = 80)
    private List<String> tags = new ArrayList<>();

    @Column(nullable = false, length = 80)
    private String source;

    @Column(nullable = false, length = 80)
    private String dateLabel;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String ocrText;

    @Column(nullable = false)
    private boolean pinned;

    @Column(nullable = false)
    private boolean featured;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    protected MyspaceItem() {
    }

    public MyspaceItem(
            String id,
            String title,
            String body,
            String subject,
            List<String> tags,
            String source,
            String dateLabel,
            String ocrText,
            boolean pinned,
            boolean featured
    ) {
        this.id = id;
        this.title = title;
        this.body = body;
        this.subject = subject;
        this.tags = tags == null ? new ArrayList<>() : new ArrayList<>(tags);
        this.source = source;
        this.dateLabel = dateLabel;
        this.ocrText = ocrText;
        this.pinned = pinned;
        this.featured = featured;
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public void apply(
            String title,
            String body,
            String subject,
            List<String> tags,
            String source,
            String dateLabel,
            String ocrText,
            boolean pinned,
            boolean featured
    ) {
        this.title = title;
        this.body = body;
        this.subject = subject;
        this.tags = tags == null ? new ArrayList<>() : new ArrayList<>(tags);
        this.source = source;
        this.dateLabel = dateLabel;
        this.ocrText = ocrText;
        this.pinned = pinned;
        this.featured = featured;
    }

    public String getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getBody() {
        return body;
    }

    public String getSubject() {
        return subject;
    }

    public List<String> getTags() {
        return tags;
    }

    public String getSource() {
        return source;
    }

    public String getDateLabel() {
        return dateLabel;
    }

    public String getOcrText() {
        return ocrText;
    }

    public boolean isPinned() {
        return pinned;
    }

    public boolean isFeatured() {
        return featured;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
