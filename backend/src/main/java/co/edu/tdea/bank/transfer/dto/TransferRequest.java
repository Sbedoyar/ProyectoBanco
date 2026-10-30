package co.edu.tdea.bank.transfer.dto;

import co.edu.tdea.bank.transfer.entity.Transfer;
import jakarta.validation.constraints.*;
/** Transfer intent; the origin is always resolved from the authenticated identity. */
public record TransferRequest(@NotBlank @Pattern(regexp="[0-9]{12}") String targetAccountNumber,
                                  @NotBlank String amount) {}
