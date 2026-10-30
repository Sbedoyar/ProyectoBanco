package co.edu.tdea.bank.shared.exception;

import jakarta.validation.constraints.*;
import java.util.*;
/** Safe error contract without stack traces, SQL or secrets. */
public record ErrorResponse(String code,String message,Map<String,String> fieldErrors) {}
