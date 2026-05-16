package com.project.tracker.config;

import com.project.tracker.dto.R;
import com.project.tracker.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(BusinessException.class)
    public R<Void> handleBusinessException(BusinessException e) {
        log.warn("{}", e.getMessage());
        return R.fail(e.getCode(), e.getMessage());
    }
    @ExceptionHandler(Exception.class)
    public R<Void> handleException(Exception e) {
        log.error("{}", e.getMessage(), e);
        return R.fail("" + e.getMessage());
    }
}
