package co.edu.tdea.bank.auth.repository;

import co.edu.tdea.bank.auth.dto.IdentityResponse;
import co.edu.tdea.bank.auth.entity.User;
import org.springframework.data.jpa.repository.*;
import java.util.*;
/** IdentityResponse lookup by already normalized email. Infrastructure failures propagate to the transaction. */
public interface UserRepository extends JpaRepository<User,Long> {
    /** Finds an identity without treating an absent email as an application error.
     * @param email normalized unique address
     * @return matching identity, or empty
     */
    Optional<User> findByEmail(String email);
}
