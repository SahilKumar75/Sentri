package com.sentri.backend.controller;

import com.sentri.backend.domain.AuthSession;
import com.sentri.backend.dto.request.CreateCalorieLogRequest;
import com.sentri.backend.dto.response.CalorieLogResponse;
import com.sentri.backend.dto.response.DailyCalorieSummaryResponse;
import com.sentri.backend.service.CalorieLogService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/calories")
public class CalorieLogController {

    private final CalorieLogService calorieLogService;

    public CalorieLogController(CalorieLogService calorieLogService) {
        this.calorieLogService = calorieLogService;
    }

    @PostMapping
    public ResponseEntity<CalorieLogResponse> addEntry(
            @Valid @RequestBody CreateCalorieLogRequest request,
            AuthSession authSession) {
        // authSession is provided by a custom argument resolver
        CalorieLogResponse response = calorieLogService.addEntry(authSession.getUser().getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/daily")
    public ResponseEntity<DailyCalorieSummaryResponse> getDailySummary(
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            AuthSession authSession) {
        DailyCalorieSummaryResponse response = calorieLogService.getDailySummary(authSession.getUser().getId(), date);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<CalorieLogResponse>> listAll(AuthSession authSession) {
        List<CalorieLogResponse> response = calorieLogService.listAll(authSession.getUser().getId());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{logId}")
    public ResponseEntity<Void> deleteEntry(
            @PathVariable Long logId,
            AuthSession authSession) {
        calorieLogService.deleteEntry(authSession.getUser().getId(), logId);
        return ResponseEntity.noContent().build();
    }
}
