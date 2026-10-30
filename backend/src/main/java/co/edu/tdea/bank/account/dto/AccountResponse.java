package co.edu.tdea.bank.account.dto;

import jakarta.validation.constraints.*;
/** Own account data. */
public record AccountResponse(String number,String balance,String currency) {}
