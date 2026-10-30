package co.edu.tdea.bank.auth.service;

import co.edu.tdea.bank.auth.dto.RegistrationRequest;
import co.edu.tdea.bank.auth.dto.IdentityResponse;
import co.edu.tdea.bank.auth.entity.User;
import co.edu.tdea.bank.auth.repository.UserRepository;
import co.edu.tdea.bank.account.entity.Account;
import co.edu.tdea.bank.account.repository.AccountRepository;
import co.edu.tdea.bank.shared.exception.BankException;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.jdbc.core.JdbcTemplate;
/** AuthService application operations; transactional calls are made through the Spring proxy. */
@Service
public class AuthService {
    private final UserRepository users;
    private final AccountRepository accounts;
    private final PasswordEncoder encoder;
    private final JdbcTemplate jdbc;
    AuthService(UserRepository users, AccountRepository accounts, PasswordEncoder encoder, JdbcTemplate jdbc) {
        this.users = users;
        this.accounts = accounts;
        this.encoder = encoder;
        this.jdbc = jdbc;
    }
    /** Registers exactly one account and opening atomically.
     * @param request validated registration
     * @return public identity; does not log in
     * @throws BankException if the normalized email is already registered
     */
    @Transactional
    public IdentityResponse register(RegistrationRequest request) {
        String email=request.email().trim().toLowerCase(Locale.ROOT);
        if(users.findByEmail(email).isPresent()) throw new BankException(409,"EMAIL_EXISTS","El correo ya está registrado.");
        User user=users.saveAndFlush(new User(request.name().trim(),email,encoder.encode(request.password())));
        Account account=accounts.saveAndFlush(new Account(user.getId(),String.format(Locale.ROOT,"%012d",accounts.nextNumber())));
        jdbc.update("insert into opening_movement(account_id,amount,created_at) values (?,?,?)",
            account.getId(),account.getBalance(),java.sql.Timestamp.from(account.getOpenedAt()));
        return new IdentityResponse(user.getId(),user.getName(),user.getEmail());
    }
    /** Returns public data for an authenticated principal.
     * @param email authenticated principal
     * @return identity without credentials
     */
    @Transactional(readOnly=true)
    public IdentityResponse identity(String email) {
        User u=user(email); return new IdentityResponse(u.getId(),u.getName(),u.getEmail());
    }
    private User user(String email) { return users.findByEmail(email).orElseThrow(()->new BankException(401,"UNAUTHENTICATED","Inicia sesión para continuar.")); }
}
