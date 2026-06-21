package com.livekick.exception;

import org.springframework.http.HttpStatus;

public class ExternalServiceException extends BusinessException {

    public ExternalServiceException(String message) {
        super(HttpStatus.SERVICE_UNAVAILABLE, "EXTERNAL_SERVICE_UNAVAILABLE", message);
    }
}