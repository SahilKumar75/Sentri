package com.sentri.backend.service;

import java.util.List;

public interface MyspaceVectorStoreService {

    boolean isAvailable();

    void upsert(MyspaceVectorDocument document);

    void upsertAll(List<MyspaceVectorDocument> documents);

    List<MyspaceVectorMatch> search(float[] embedding, int limit);
}
