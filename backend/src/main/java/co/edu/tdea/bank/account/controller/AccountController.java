package co.edu.tdea.bank.account.controller;

import co.edu.tdea.bank.account.dto.AccountResponse;
import co.edu.tdea.bank.account.service.AccountService;

import jakarta.servlet.http.*;
import java.security.Principal;
import java.util.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.authentication.*;

/** HTTP boundary for account operations; business rules live in the application service. */
@RestController @RequestMapping("/api")
public class AccountController {
    private final AccountService bank;
    AccountController(AccountService bank) {
        this.bank = bank;
    }
    /** Returns only the current user's account.
     * @param principal authenticated owner
     * @return number, exact balance and COP
     */
    @GetMapping("/account") public AccountResponse account(Principal principal) { return bank.account(principal.getName()); }
}
