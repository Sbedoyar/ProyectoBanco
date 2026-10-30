package co.edu.tdea.bank;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** Entry point for the local academic banking simulation. */
@SpringBootApplication
public class BankApplication {
    /** Starts the HTTP server and validates the dedicated database schema.
     * @param args Spring Boot command-line arguments
     */
    public static void main(String[] args) { SpringApplication.run(BankApplication.class, args); }
}
