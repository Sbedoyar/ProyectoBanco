package co.edu.tdea.bank.shared.config;

import co.edu.tdea.bank.auth.dto.RegistrationRequest;
import co.edu.tdea.bank.auth.repository.UserRepository;
import co.edu.tdea.bank.auth.service.AuthService;

import org.springframework.boot.*;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/** Adds two fictional demonstration users once; never resets existing balances. */
@Component @Profile("demo")
class DemoData implements ApplicationRunner {
    private final AuthService bank;
    private final UserRepository users;
    DemoData(AuthService bank,UserRepository users) { this.bank=bank;
        this.users=users; }
    /** Seeds only missing demo identities.
     * @param args unused application arguments
     */
    @Override public void run(ApplicationArguments args) {
        seed("Ana Martínez","ana@example.test"); seed("Luis Gómez","luis@example.test");
    }
    private void seed(String name,String email) {
        if(users.findByEmail(email).isEmpty()) bank.register(new RegistrationRequest(name,email,"Academia2026!"));
    }
}
