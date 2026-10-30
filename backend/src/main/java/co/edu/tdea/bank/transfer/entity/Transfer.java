package co.edu.tdea.bank.transfer.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/** Persisted, confirmed transfer. Rejected requests never produce this entity. */
@Entity @Table(name="bank_transfer")
public class Transfer {
    @Id private UUID id;
    @Column(name="source_id",nullable=false) private Long sourceId;
    @Column(name="target_id",nullable=false) private Long targetId;
    @Column(nullable=false,precision=19,scale=2) private BigDecimal amount;
    @Column(name="created_at",nullable=false) private Instant createdAt;
    @Column(name="idempotency_key",nullable=false) private UUID idempotencyKey;
    protected Transfer() {}
    /** Records an intended transfer inside the caller's locked transaction.
     * @param source locked source account ID
     * @param target locked destination account ID
     * @param amount validated positive exact COP amount
     * @param key source-scoped stable operation key
     */
    public Transfer(Long source,Long target,BigDecimal amount,UUID key) {
        id=UUID.randomUUID(); sourceId=source; targetId=target;
        this.amount=amount;
        idempotencyKey=key; createdAt=Instant.now().truncatedTo(java.time.temporal.ChronoUnit.MICROS);
    }
    public UUID getId() { return id; }
    public Long getSourceId() { return sourceId; }
    public Long getTargetId() { return targetId; }
    public BigDecimal getAmount() { return amount; }
    public Instant getCreatedAt() { return createdAt; }
    public UUID getIdempotencyKey() { return idempotencyKey; }
}
