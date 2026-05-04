package com.sentri.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class DuplicateBatchException extends RuntimeException {

    public DuplicateBatchException(String message) {
        super(message);
    }
}
