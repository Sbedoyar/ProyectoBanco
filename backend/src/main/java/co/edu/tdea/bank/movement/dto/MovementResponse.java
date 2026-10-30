package co.edu.tdea.bank.movement.dto;

import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.*;
/** A user's opening, sent or received movement, ordered by time and stable ID. */
public record MovementResponse(String id,String type,UUID reference,String amount,String currency,
                           Instant occurredAt,String counterparty) {}
