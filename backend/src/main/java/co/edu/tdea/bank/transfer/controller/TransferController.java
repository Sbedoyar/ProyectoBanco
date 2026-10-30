package co.edu.tdea.bank.transfer.controller;

import co.edu.tdea.bank.transfer.dto.TransferRequest;
import co.edu.tdea.bank.transfer.dto.TransferReceiptResponse;
import co.edu.tdea.bank.transfer.service.TransferService;

import jakarta.servlet.http.*;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.authentication.*;

/** HTTP boundary for transfer operations; business rules live in the application service. */
@RestController @RequestMapping("/api")
public class TransferController {
    private final TransferService bank;
    TransferController(TransferService bank) {
        this.bank = bank;
    }
    /** Submits or safely replays an intended transfer.
     * @param principal authenticated source owner
     * @param key client-retained operation key
     * @param body target and decimal amount
     * @return 201 new receipt or 200 identical replay
     */
    @PostMapping("/transfers") public ResponseEntity<TransferReceiptResponse> transfer(Principal principal,@RequestHeader("Idempotency-Key") UUID key,@Valid @RequestBody TransferRequest body) {
        var result=bank.transfer(principal.getName(),key,body); return ResponseEntity.status(result.created()?201:200).body(result.receipt());
    }
    /** Finds an own confirmed request after an uncertain network result.
     * @param principal authenticated source owner
     * @param key operation key
     * @return receipt or 404, which is not definitive failure of an in-flight request
     */
    @GetMapping("/transfers/by-key/{key}") public TransferReceiptResponse byKey(Principal principal,@PathVariable UUID key) { return bank.byKey(principal.getName(),key); }
    /** Retrieves a receipt for either participant only.
     * @param principal authenticated user
     * @param reference transfer reference
     * @return receipt or 404 for absent/foreign operations
     */
    @GetMapping("/transfers/{reference}") public TransferReceiptResponse receipt(Principal principal,@PathVariable UUID reference) { return bank.byReference(principal.getName(),reference); }
}
