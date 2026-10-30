package co.edu.tdea.bank.transfer.dto;

import jakarta.validation.constraints.*;
/** New versus replayed result determines HTTP 201 versus 200. */
public record TransferResult(TransferReceiptResponse receipt,boolean created) {}
