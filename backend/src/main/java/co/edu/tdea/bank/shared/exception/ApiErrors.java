package co.edu.tdea.bank.shared.exception;


import java.util.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.dao.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.bind.MissingRequestHeaderException;

/** Maps expected errors to safe, actionable JSON without revealing implementation details. */
@RestControllerAdvice
class ApiErrors {
    @ExceptionHandler(BankException.class)
    ResponseEntity<ErrorResponse> business(BankException e) { return error(e.status,e.code,e.getMessage()); }
    @ExceptionHandler(AuthenticationException.class)
    ResponseEntity<ErrorResponse> authentication(AuthenticationException e) { return error(401,"INVALID_CREDENTIALS","Correo o contraseña incorrectos."); }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ErrorResponse> validation(MethodArgumentNotValidException e) {
        Map<String,String> fields=new LinkedHashMap<>();
        e.getBindingResult().getFieldErrors().forEach(f->fields.put(f.getField(),"Revisa el formato y la longitud de este campo."));
        return ResponseEntity.badRequest().body(new ErrorResponse("VALIDATION_ERROR","Revisa los campos del formulario.",fields));
    }
    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<ErrorResponse> conflict(DataIntegrityViolationException e) { return error(409,"DATA_CONFLICT","La solicitud entra en conflicto con un registro existente."); }
    @ExceptionHandler(PessimisticLockingFailureException.class)
    ResponseEntity<ErrorResponse> locked(PessimisticLockingFailureException e) { return error(503,"RETRY_OPERATION","La cuenta está ocupada. Reintenta la misma operación."); }
    @ExceptionHandler({HttpMessageNotReadableException.class,MethodArgumentTypeMismatchException.class,MissingRequestHeaderException.class})
    ResponseEntity<ErrorResponse> malformed(Exception e) { return error(400,"INVALID_REQUEST","La solicitud tiene datos inválidos o incompletos."); }
    private ResponseEntity<ErrorResponse> error(int status,String code,String message) {
        return ResponseEntity.status(status).body(new ErrorResponse(code,message,Map.of()));
    }
}
