package co.edu.tdea.bank.account.repository;

import co.edu.tdea.bank.account.entity.Account;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.*;
/** Account persistence with explicit write locks used in ascending ID order. */
public interface AccountRepository extends JpaRepository<Account,Long> {
    /** Finds the single account assigned to an owner.
     * @param ownerId authenticated user's internal ID
     * @return own account if provisioned
     */
    Optional<Account> findByOwnerId(Long ownerId);
    /** Resolves a public destination number; does not itself authorize a transfer.
     * @param number twelve-digit account number
     * @return matching destination or empty
     */
    Optional<Account> findByNumber(String number);
    /** Locks an account until the enclosing transaction completes.
     * @param id internal account ID; acquire all required IDs in ascending order
     * @return locked entity if present; callers refresh after waiting for another transaction
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select a from Account a where a.id=:id")
    Optional<Account> lock(@Param("id") Long id);
    /** Allocates a unique sequence value; rolled-back registrations may leave harmless gaps.
     * @return value formatted into a public number by registration
     */
    @Query(value="select nextval('account_number_seq')",nativeQuery=true)
    Long nextNumber();
}
