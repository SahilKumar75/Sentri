package com.sentri.backend.service;

import org.springframework.web.multipart.MultipartFile;

public interface TimetableUploadStorageService {

    StoredTimetableUpload store(MultipartFile file);
}
