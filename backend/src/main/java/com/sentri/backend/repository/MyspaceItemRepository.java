package com.sentri.backend.repository;

import com.sentri.backend.domain.MyspaceItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MyspaceItemRepository extends JpaRepository<MyspaceItem, String> {

    List<MyspaceItem> findAllByOrderByPinnedDescFeaturedDescUpdatedAtDesc();
}
