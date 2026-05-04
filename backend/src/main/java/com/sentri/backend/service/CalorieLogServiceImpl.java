package com.sentri.backend.service;

import com.sentri.backend.domain.CalorieLog;
import com.sentri.backend.domain.UserAccount;
import com.sentri.backend.dto.request.CreateCalorieLogRequest;
import com.sentri.backend.dto.response.CalorieLogResponse;
import com.sentri.backend.dto.response.DailyCalorieSummaryResponse;
import com.sentri.backend.exception.BadRequestException;
import com.sentri.backend.exception.ResourceNotFoundException;
import com.sentri.backend.repository.CalorieLogRepository;
import com.sentri.backend.repository.UserAccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CalorieLogServiceImpl implements CalorieLogService {

    private final CalorieLogRepository calorieLogRepository;
    private final UserAccountRepository userAccountRepository;

    public CalorieLogServiceImpl(CalorieLogRepository calorieLogRepository, UserAccountRepository userAccountRepository) {
        this.calorieLogRepository = calorieLogRepository;
        this.userAccountRepository = userAccountRepository;
    }

    @Override
    @Transactional
    public CalorieLogResponse addEntry(Long userId, CreateCalorieLogRequest request) {
        UserAccount user = userAccountRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User account not found"));

        CalorieLog log = new CalorieLog();
        log.setUser(user);
        log.setLogDate(request.getLogDate());
        log.setFoodLabel(request.getFoodLabel());
        log.setCalories(request.getCalories());
        log.setMealSlot(request.getMealSlot());
        log.setNoteText(request.getNoteText());

        log = calorieLogRepository.save(log);
        return mapToDto(log);
    }

    @Override
    @Transactional(readOnly = true)
    public DailyCalorieSummaryResponse getDailySummary(Long userId, LocalDate date) {
        int totalCalories = calorieLogRepository.sumCaloriesByUserAndDate(userId, date);
        List<CalorieLogResponse> entries = calorieLogRepository.findByUserIdAndLogDateOrderByCreatedAtAsc(userId, date)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return new DailyCalorieSummaryResponse(date, totalCalories, entries);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CalorieLogResponse> listAll(Long userId) {
        return calorieLogRepository.findByUserIdOrderByLogDateDescCreatedAtDesc(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteEntry(Long userId, Long logId) {
        CalorieLog log = calorieLogRepository.findById(logId)
                .orElseThrow(() -> new ResourceNotFoundException("Calorie log not found"));

        if (!log.getUser().getId().equals(userId)) {
            throw new BadRequestException("Not authorized to delete this log entry");
        }

        calorieLogRepository.delete(log);
    }

    private CalorieLogResponse mapToDto(CalorieLog log) {
        return new CalorieLogResponse(
                log.getId(),
                log.getLogDate(),
                log.getFoodLabel(),
                log.getCalories(),
                log.getMealSlot(),
                log.getNoteText(),
                log.getCreatedAt(),
                log.getUpdatedAt()
        );
    }
}
