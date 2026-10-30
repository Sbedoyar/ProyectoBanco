package co.edu.tdea.bank.movement.controller;

import co.edu.tdea.bank.movement.dto.MovementPageResponse;
import co.edu.tdea.bank.movement.service.MovementService;

import jakarta.servlet.http.*;
import java.security.Principal;
import java.util.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.authentication.*;

/** HTTP boundary for movement operations; business rules live in the application service. */
@RestController @RequestMapping("/api")
public class MovementController {
    private final MovementService bank;
    MovementController(MovementService bank) {
        this.bank = bank;
    }
    /** Returns bounded own history.
     * @param principal authenticated owner
     * @param page zero-based page
     * @param size page size up to 100
     * @return own opening and sent/received transfers
     */
    @GetMapping("/movements") public MovementPageResponse movements(Principal principal,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size) {
        return bank.movements(principal.getName(),page,size);
    }
}
