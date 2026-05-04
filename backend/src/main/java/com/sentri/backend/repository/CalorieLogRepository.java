package com.sentri.backend.repository;

import com.sentri.backend.domain.CalorieLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository for {@link CalorieLog} persistence.
 */
@Repository
public interface CalorieLogRepository extends JpaRepository<CalorieLog, Long> {

    /**
     * Returns all calorie logs for a user ordered by date descending, then creation time.
     */
    List<CalorieLog> findByUserIdOrderByLogDateDescCreatedAtDesc(Long userId);

    /**
     * Returns all logs for a user on a specific date.
     */
    List<CalorieLog> findByUserIdAndLogDateOrderByCreatedAtAsc(Long userId, LocalDate logDate);

    /**
     * Returns the total calories for a user on a specific date.
     */
    @Query("SELECT COALESCE(SUM(c.calories), 0) FROM CalorieLog c WHERE c.user.id = :userId AND c.logDate = :date")
    int sumCaloriesByUserAndDate(@Param("userId") Long userId, @Param("date") LocalDate date);

    /**
     * Returns all logs for a user within a date range (inclusive).
     */
    @Query("SELECT c FROM CalorieLog c WHERE c.user.id = :userId AND c.logDate BETWEEN :from AND :to ORDER BY c.logDate ASC, c.createdAt ASC")
    List<CalorieLog> findByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );
}
