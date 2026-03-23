package com.sentri.backend.repository;

import com.sentri.backend.domain.TimetableBatch;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TimetableBatchRepository extends JpaRepository<TimetableBatch, Long> {

    List<TimetableBatch> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = "entries")
    @Query("select b from TimetableBatch b where b.id = :id")
    Optional<TimetableBatch> findByIdWithEntries(@Param("id") Long id);
}
