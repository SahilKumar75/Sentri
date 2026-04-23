package com.sentri.backend.service;

import com.sentri.backend.domain.MyspaceItem;
import com.sentri.backend.dto.request.MyspaceSearchItemRequest;
import com.sentri.backend.dto.request.UpsertMyspaceItemRequest;
import com.sentri.backend.dto.response.MyspaceItemResponse;
import com.sentri.backend.exception.ResourceNotFoundException;
import com.sentri.backend.repository.MyspaceItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MyspaceItemServiceImpl implements MyspaceItemService {

    private final MyspaceItemRepository myspaceItemRepository;

    public MyspaceItemServiceImpl(MyspaceItemRepository myspaceItemRepository) {
        this.myspaceItemRepository = myspaceItemRepository;
    }

    @Override
    @Transactional
    public MyspaceItemResponse upsert(UpsertMyspaceItemRequest request) {
        MyspaceItem item = myspaceItemRepository.findById(request.id())
                .map(existing -> {
                    existing.apply(
                            request.title(),
                            request.body(),
                            request.subject(),
                            request.tags(),
                            request.source(),
                            request.dateLabel(),
                            request.ocrText(),
                            request.pinned(),
                            request.featured()
                    );
                    return existing;
                })
                .orElseGet(() -> new MyspaceItem(
                        request.id(),
                        request.title(),
                        request.body(),
                        request.subject(),
                        request.tags(),
                        request.source(),
                        request.dateLabel(),
                        request.ocrText(),
                        request.pinned(),
                        request.featured()
                ));

        return toResponse(myspaceItemRepository.save(item));
    }

    @Override
    @Transactional(readOnly = true)
    public MyspaceItemResponse getItem(String itemId) {
        return toResponse(load(itemId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MyspaceItemResponse> listItems() {
        return myspaceItemRepository.findAllByOrderByPinnedDescFeaturedDescUpdatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void deleteItem(String itemId) {
        if (!myspaceItemRepository.existsById(itemId)) {
            throw new ResourceNotFoundException("Myspace item not found: " + itemId);
        }
        myspaceItemRepository.deleteById(itemId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MyspaceSearchItemRequest> listSearchItems() {
        return myspaceItemRepository.findAllByOrderByPinnedDescFeaturedDescUpdatedAtDesc()
                .stream()
                .map(this::toSearchItem)
                .toList();
    }

    private MyspaceItem load(String itemId) {
        return myspaceItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Myspace item not found: " + itemId));
    }

    private MyspaceItemResponse toResponse(MyspaceItem item) {
        return new MyspaceItemResponse(
                item.getId(),
                item.getTitle(),
                item.getBody(),
                item.getSubject(),
                item.getTags(),
                item.getSource(),
                item.getDateLabel(),
                item.getOcrText(),
                item.isPinned(),
                item.isFeatured(),
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }

    private MyspaceSearchItemRequest toSearchItem(MyspaceItem item) {
        return new MyspaceSearchItemRequest(
                item.getId(),
                item.getTitle(),
                item.getBody(),
                item.getSubject(),
                item.getTags(),
                item.getSource(),
                item.getDateLabel(),
                item.getOcrText(),
                item.isPinned(),
                item.isFeatured()
        );
    }
}
