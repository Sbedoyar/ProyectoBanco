package co.edu.tdea.bank.transfer.repository;

import co.edu.tdea.bank.transfer.entity.Transfer;
import org.springframework.data.jpa.repository.*;
import java.util.*;
/** Confirmed transfers, including source-scoped idempotency lookup. */
public interface TransferRepository extends JpaRepository<Transfer,UUID> {
    /** Looks up one source owner's prior committed intent.
     * @param sourceId account resolved from authenticated principal
     * @param key retained operation key
     * @return confirmed transfer, or empty; a concurrent request may still be in flight
     */
    Optional<Transfer> findBySourceIdAndIdempotencyKey(Long sourceId,UUID key);
}
