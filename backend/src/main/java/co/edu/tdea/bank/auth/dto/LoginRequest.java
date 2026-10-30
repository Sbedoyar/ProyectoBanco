package co.edu.tdea.bank.auth.dto;

import jakarta.validation.constraints.*;
/** LoginRequest credentials; error messages never reveal which field matched. */
public record LoginRequest(@NotBlank @Size(max=254) String email,@NotBlank @Size(max=128) String password) {}
