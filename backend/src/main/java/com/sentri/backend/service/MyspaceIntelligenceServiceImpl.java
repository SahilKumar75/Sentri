package com.sentri.backend.service;

import com.sentri.backend.dto.request.MyspaceSearchItemRequest;
import com.sentri.backend.dto.request.MyspaceSearchRequest;
import com.sentri.backend.dto.response.MyspaceSearchMatchResponse;
import com.sentri.backend.dto.response.MyspaceSearchResponse;
import com.sentri.backend.exception.BadRequestException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class MyspaceIntelligenceServiceImpl implements MyspaceIntelligenceService {

    private static final Map<String, List<String>> SUBJECT_ALIASES = Map.of(
            "DBMS", List.of("database", "db", "normalization", "sql"),
            "P&S", List.of("math", "statistics", "probability", "permutation", "combination"),
            "OS", List.of("operating systems", "paging", "cpu", "memory"),
            "CG", List.of("graphics", "z buffer", "transformation", "rendering"),
            "PM", List.of("project", "sprint", "timeline"),
            "Placement", List.of("interview", "aptitude", "company", "job")
    );

    private static final Map<String, List<String>> CONTEXT_ALIASES = Map.of(
            "blackboard", List.of("board", "chalkboard", "class board"),
            "screenshot", List.of("screen", "slide", "capture"),
            "image", List.of("photo", "picture"),
            "revision", List.of("study", "prep", "practice")
    );

    private final MyspaceItemService myspaceItemService;
    private final MyspaceVectorStoreService myspaceVectorStoreService;

    public MyspaceIntelligenceServiceImpl() {
        this(new NoOpMyspaceItemService(), new NoOpMyspaceVectorStoreService());
    }

    public MyspaceIntelligenceServiceImpl(MyspaceVectorStoreService myspaceVectorStoreService) {
        this(new NoOpMyspaceItemService(), myspaceVectorStoreService);
    }

    public MyspaceIntelligenceServiceImpl(
            MyspaceItemService myspaceItemService,
            MyspaceVectorStoreService myspaceVectorStoreService
    ) {
        this.myspaceItemService = myspaceItemService;
        this.myspaceVectorStoreService = myspaceVectorStoreService;
    }

    @Override
    public MyspaceSearchResponse search(MyspaceSearchRequest request) {
        if (request == null) {
            throw new BadRequestException("Myspace search request is required");
        }

        String query = request.query() == null ? "" : request.query().trim().toLowerCase();
        String selectedSubject = request.selectedSubject() == null || request.selectedSubject().isBlank()
                ? "All"
                : request.selectedSubject().trim();
        List<MyspaceSearchItemRequest> searchItems = request.items() == null || request.items().isEmpty()
                ? myspaceItemService.listSearchItems()
                : request.items();

        if (searchItems == null || searchItems.isEmpty()) {
            return new MyspaceSearchResponse(query, selectedSubject, 0, List.of());
        }

        Map<String, MyspaceVectorMatch> vectorMatchesById = loadVectorMatches(request);

        List<MyspaceSearchMatchResponse> matches = new ArrayList<>();
        for (int index = 0; index < searchItems.size(); index++) {
            MyspaceSearchMatchResponse match = scoreItem(
                    searchItems.get(index),
                    query,
                    selectedSubject,
                    index,
                    vectorMatchesById.get(searchItems.get(index).id())
            );
            if (match != null) {
                matches.add(match);
            }
        }

        matches.sort(Comparator
                .comparing(MyspaceSearchMatchResponse::score).reversed()
                .thenComparing(MyspaceSearchMatchResponse::title));

        return new MyspaceSearchResponse(query, selectedSubject, matches.size(), matches);
    }

    private MyspaceSearchMatchResponse scoreItem(
            MyspaceSearchItemRequest item,
            String query,
            String selectedSubject,
            int index,
            MyspaceVectorMatch vectorMatch
    ) {
        if (!"All".equals(selectedSubject) && !selectedSubject.equals(item.subject())) {
            return null;
        }

        Double vectorSimilarity = vectorMatch == null ? null : vectorMatch.similarity();

        if (query.isBlank()) {
            int score = (Boolean.TRUE.equals(item.pinned()) ? 100 : 0)
                    + (Boolean.TRUE.equals(item.featured()) ? 30 : 0)
                    - index;
            if (vectorSimilarity != null) {
                score += vectorBoost(vectorSimilarity);
            }
            List<String> reasons = new ArrayList<>();
            if (Boolean.TRUE.equals(item.featured())) {
                reasons.add("semantic-alias");
            } else {
                reasons.add("tag");
            }
            if (vectorSimilarity != null) {
                reasons.add("vector");
            }
            return new MyspaceSearchMatchResponse(
                    item.id(),
                    item.title(),
                    item.subject(),
                    item.source(),
                    item.dateLabel(),
                    score,
                    vectorSimilarity,
                    reasons,
                    buildExplanation(reasons)
            );
        }

        String title = safe(item.title()).toLowerCase();
        String body = safe(item.body()).toLowerCase();
        String subject = safe(item.subject()).toLowerCase();
        String source = safe(item.source()).toLowerCase();
        String dateLabel = safe(item.dateLabel()).toLowerCase();
        String ocrText = safe(item.ocrText()).toLowerCase();
        List<String> tags = item.tags() == null ? List.of() : item.tags().stream().map(String::toLowerCase).toList();

        String[] tokens = query.split("\\s+");
        int score = 0;
        Set<String> reasons = new LinkedHashSet<>();

        for (String token : tokens) {
            if (title.contains(token)) {
                score += 28;
                reasons.add("title");
            }
            if (body.contains(token)) {
                score += 16;
                reasons.add("body");
            }
            if (subject.contains(token)) {
                score += 18;
                reasons.add("subject");
            }
            if (source.contains(token)) {
                score += 12;
                reasons.add("source");
            }
            if (dateLabel.contains(token)) {
                score += 10;
                reasons.add("date");
            }
            if (ocrText.contains(token)) {
                score += 22;
                reasons.add("ocr");
            }
            if (tags.stream().anyMatch(tag -> tag.contains(token))) {
                score += 14;
                reasons.add("tag");
            }

            List<String> aliases = expandAliases(token);
            if (SUBJECT_ALIASES.getOrDefault(item.subject(), List.of()).stream().anyMatch(alias -> aliases.stream().anyMatch(alias::contains))) {
                score += 20;
                reasons.add("subject-alias");
            }
            if (aliases.stream().anyMatch(alias -> source.contains(alias) || tags.stream().anyMatch(tag -> tag.contains(alias)))) {
                score += 11;
                reasons.add("context-alias");
            }
            if (aliases.stream().anyMatch(alias -> body.contains(alias) || ocrText.contains(alias))) {
                score += 9;
                reasons.add("semantic-alias");
            }
        }

        if (score == 0) {
            if (vectorSimilarity == null) {
                return null;
            }
            score = vectorBoost(vectorSimilarity);
            reasons.add("vector");
        } else if (vectorSimilarity != null) {
            score += vectorBoost(vectorSimilarity);
            reasons.add("vector");
        }

        List<String> orderedReasons = new ArrayList<>(reasons);
        return new MyspaceSearchMatchResponse(
                item.id(),
                item.title(),
                item.subject(),
                item.source(),
                item.dateLabel(),
                score,
                vectorSimilarity,
                orderedReasons,
                buildExplanation(orderedReasons)
        );
    }

    private Map<String, MyspaceVectorMatch> loadVectorMatches(MyspaceSearchRequest request) {
        if (request.queryEmbedding() == null || request.queryEmbedding().isEmpty() || !myspaceVectorStoreService.isAvailable()) {
            return Map.of();
        }

        int limit = request.vectorLimit() == null ? 8 : request.vectorLimit();
        List<MyspaceVectorMatch> vectorMatches = myspaceVectorStoreService.search(toFloatArray(request.queryEmbedding()), limit);
        Map<String, MyspaceVectorMatch> matchesById = new HashMap<>();
        for (MyspaceVectorMatch match : vectorMatches) {
            matchesById.put(match.itemId(), match);
        }
        return matchesById;
    }

    private List<String> expandAliases(String token) {
        Set<String> aliases = new LinkedHashSet<>();
        aliases.add(token);
        CONTEXT_ALIASES.forEach((root, related) -> {
            if (root.contains(token) || related.stream().anyMatch(value -> value.contains(token))) {
                aliases.add(root);
                aliases.addAll(related);
            }
        });
        return new ArrayList<>(aliases);
    }

    private String buildExplanation(List<String> reasons) {
        if (reasons.contains("vector") && reasons.size() > 1) return "Matched text and vector similarity";
        if (reasons.contains("vector")) return "Matched vector similarity";
        if (reasons.contains("title")) return "Matched title";
        if (reasons.contains("subject-alias")) return "Matched subject alias";
        if (reasons.contains("ocr")) return "Matched OCR text";
        if (reasons.contains("context-alias")) return "Matched source or context";
        if (reasons.contains("date")) return "Matched date memory";
        return "Matched by context";
    }

    private int vectorBoost(double similarity) {
        return (int) Math.round(Math.max(0, Math.min(1, similarity)) * 40);
    }

    private float[] toFloatArray(List<Float> embedding) {
        float[] values = new float[embedding.size()];
        for (int index = 0; index < embedding.size(); index++) {
            values[index] = embedding.get(index);
        }
        return values;
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private static final class NoOpMyspaceVectorStoreService implements MyspaceVectorStoreService {

        @Override
        public boolean isAvailable() {
            return false;
        }

        @Override
        public void upsert(MyspaceVectorDocument document) {
        }

        @Override
        public void upsertAll(List<MyspaceVectorDocument> documents) {
        }

        @Override
        public List<MyspaceVectorMatch> search(float[] embedding, int limit) {
            return List.of();
        }
    }

    private static final class NoOpMyspaceItemService implements MyspaceItemService {

        @Override
        public com.sentri.backend.dto.response.MyspaceItemResponse upsert(com.sentri.backend.dto.request.UpsertMyspaceItemRequest request) {
            throw new UnsupportedOperationException("No-op service");
        }

        @Override
        public com.sentri.backend.dto.response.MyspaceItemResponse getItem(String itemId) {
            throw new UnsupportedOperationException("No-op service");
        }

        @Override
        public List<com.sentri.backend.dto.response.MyspaceItemResponse> listItems() {
            return List.of();
        }

        @Override
        public void deleteItem(String itemId) {
            throw new UnsupportedOperationException("No-op service");
        }

        @Override
        public List<MyspaceSearchItemRequest> listSearchItems() {
            return List.of();
        }
    }
}
