package co.edu.tdea.bank.account.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

/** A user's single COP account; balance changes only in a locked transaction. */
@Entity @Table(name="account")
public class Account {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(name="owner_id",nullable=false,unique=true) private Long ownerId;
    @Column(nullable=false,unique=true,length=12) private String number;
    @Column(nullable=false,precision=19,scale=2) private BigDecimal balance;
    @Column(name="opened_at",nullable=false) private Instant openedAt;
    protected Account() {}
    /** Creates the single fictitious COP account provisioned during registration.
     * @param ownerId persisted user identity
     * @param number unique twelve-digit public number
     */
    public Account(Long ownerId, String number) {
        this.ownerId=ownerId;
        this.number=number;
        balance=new BigDecimal("1000000.00"); openedAt=Instant.now().truncatedTo(java.time.temporal.ChronoUnit.MICROS);
    }
    public Long getId() { return id; }
    public Long getOwnerId() { return ownerId; }
    public String getNumber() { return number; }
    public BigDecimal getBalance() { return balance; }
    public Instant getOpenedAt() { return openedAt; }
    /** Changes the managed balance only while the caller holds the account write lock.
     * @param balance exact new balance within the enclosing monetary transaction
     */
    public void setBalance(BigDecimal balance) { this.balance=balance; }
}
