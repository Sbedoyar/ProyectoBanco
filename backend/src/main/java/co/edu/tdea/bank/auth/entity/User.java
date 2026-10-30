package co.edu.tdea.bank.auth.entity;

import jakarta.persistence.*;

/** Registered identity. Password hashes never form part of a response DTO. */
@Entity @Table(name="app_user")
public class User {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false,length=120) private String name;
    @Column(nullable=false,unique=true,length=254) private String email;
    @Column(name="password_hash",nullable=false,length=512) private String passwordHash;
    protected User() {}
    /** Creates an identity with an already encoded password.
     * @param name validated display name
     * @param email normalized unique email
     * @param hash adaptive password hash, never plaintext
     */
    public User(String name, String email, String hash) { this.name=name;
        this.email=email;
        this.passwordHash=hash; }
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
}
