package co.edu.tdea.bank.transfer.dto;

import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.*;
/** Immutable receipt suitable for JSON QR encoding; masked numbers reveal only four digits. */
public record TransferReceiptResponse(UUID reference,Instant occurredAt,String amount,String currency,
                          String sourceAccountMasked,String targetAccountMasked) {}
