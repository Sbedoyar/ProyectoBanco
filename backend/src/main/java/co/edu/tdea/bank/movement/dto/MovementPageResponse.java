package co.edu.tdea.bank.movement.dto;

import jakarta.validation.constraints.*;
import java.util.*;
/** Bounded page of own movements. */
public record MovementPageResponse(List<MovementResponse> items,int page,int size,boolean hasNext) {}
