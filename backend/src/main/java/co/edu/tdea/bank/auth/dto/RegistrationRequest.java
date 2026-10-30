package co.edu.tdea.bank.auth.dto;

import jakarta.validation.constraints.*;
/** RegistrationRequest data; the password is consumed only by the identity service. */
public record RegistrationRequest(@NotBlank @Size(max=120) String name,
        @NotBlank @Email @Size(max=254) String email, @NotNull @Size(min=12,max=128) String password) {}
