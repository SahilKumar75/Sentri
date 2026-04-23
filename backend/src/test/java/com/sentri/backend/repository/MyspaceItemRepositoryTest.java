package com.sentri.backend.repository;

import com.sentri.backend.domain.MyspaceItem;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class MyspaceItemRepositoryTest {

    @Autowired
    private MyspaceItemRepository myspaceItemRepository;

    @Test
    void storesOrderedMyspaceItemsWithTags() {
        myspaceItemRepository.save(new MyspaceItem(
                "item-1",
                "Pinned note",
                "Body",
                "DBMS",
                List.of("dbms", "sql"),
                "Screenshot",
                "Today",
                "ocr",
                true,
                false
        ));
        myspaceItemRepository.save(new MyspaceItem(
                "item-2",
                "Featured note",
                "Body",
                "P&S",
                List.of("math"),
                "Board",
                "Yesterday",
                "ocr",
                false,
                true
        ));

        List<MyspaceItem> items = myspaceItemRepository.findAllByOrderByPinnedDescFeaturedDescUpdatedAtDesc();
        assertThat(items).hasSize(2);
        assertThat(items.get(0).getId()).isEqualTo("item-1");
        assertThat(items.get(0).getTags()).containsExactly("dbms", "sql");
    }
}
