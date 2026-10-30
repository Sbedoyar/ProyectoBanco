package co.edu.tdea.bank.movement.service;

import co.edu.tdea.bank.movement.dto.MovementPageResponse;
import co.edu.tdea.bank.account.service.AccountService;
import co.edu.tdea.bank.movement.repository.MovementQueryRepository;
import co.edu.tdea.bank.shared.exception.BankException;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
/** MovementService application operations; transactional calls are made through the Spring proxy. */
@Service
public class MovementService {
    private final AccountService accountService;
    private final MovementQueryRepository queries;
    MovementService(AccountService accountService, MovementQueryRepository queries) {
        this.accountService = accountService;
        this.queries = queries;
    }
    /** Lists only the principal's opening and transfer movements.
     * @param email authenticated principal
     * @param page zero-based page, bounded to avoid overflow
     * @param size requested count between one and 100
     * @return stable descending page and continuation flag
     */
    @Transactional(readOnly=true)
    public MovementPageResponse movements(String email,int page,int size) {
        if(page<0||page>1000000||size<1||size>100) throw new BankException(400,"PAGE_INVALID","Paginación inválida.");
        Long id=accountService.own(email).getId();
        return queries.findByAccount(id,page,size);
    }
}
