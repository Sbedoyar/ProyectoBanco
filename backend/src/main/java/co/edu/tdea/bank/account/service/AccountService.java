package co.edu.tdea.bank.account.service;

import co.edu.tdea.bank.account.dto.AccountResponse;
import co.edu.tdea.bank.account.entity.Account;
import co.edu.tdea.bank.account.repository.AccountRepository;
import co.edu.tdea.bank.auth.repository.UserRepository;
import co.edu.tdea.bank.shared.exception.BankException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Resolves account ownership from the authenticated identity. */
@Service
public class AccountService {
    private final UserRepository users;
    private final AccountRepository accounts;

    AccountService(UserRepository users, AccountRepository accounts) {
        this.users = users;
        this.accounts = accounts;
    }

    /** Returns only the authenticated user's account.
     * @param email trusted principal email
     * @return public account number, exact balance and COP
     */
    @Transactional(readOnly = true)
    public AccountResponse account(String email) {
        Account account = own(email);
        return new AccountResponse(account.getNumber(), account.getBalance().toPlainString(), "COP");
    }

    /** Resolves the single account from a principal, never a client-provided owner ID.
     * @param email authenticated email
     * @return managed own account; mutating callers must first acquire its write lock
     * @throws BankException when the principal is not registered
     */
    @Transactional(readOnly = true)
    public Account own(String email) {
        var user = users.findByEmail(email).orElseThrow(() ->
            new BankException(401, "UNAUTHENTICATED", "Inicia sesión para continuar."));
        return accounts.findByOwnerId(user.getId()).orElseThrow();
    }
}
