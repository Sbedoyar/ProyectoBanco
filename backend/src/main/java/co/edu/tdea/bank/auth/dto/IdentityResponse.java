package co.edu.tdea.bank.auth.dto;

import jakarta.validation.constraints.*;
/** Public identity without password/hash. */
public record IdentityResponse(Long id,String name,String email) {}
