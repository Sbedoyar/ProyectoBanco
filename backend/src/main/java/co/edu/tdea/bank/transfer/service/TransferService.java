package co.edu.tdea.bank.transfer.service;

import co.edu.tdea.bank.transfer.dto.TransferRequest;
import co.edu.tdea.bank.transfer.dto.TransferReceiptResponse;
import co.edu.tdea.bank.transfer.dto.TransferResult;
import co.edu.tdea.bank.account.entity.Account;
import co.edu.tdea.bank.account.repository.AccountRepository;
import co.edu.tdea.bank.transfer.entity.Transfer;
import co.edu.tdea.bank.transfer.repository.TransferRepository;
import co.edu.tdea.bank.account.service.AccountService;
import co.edu.tdea.bank.shared.exception.BankException;
import java.math.BigDecimal;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.jdbc.core.JdbcTemplate;
/** TransferService application operations; transactional calls are made through the Spring proxy. */
@Service
public class TransferService {
    private final AccountRepository accounts;
    private final TransferRepository transfers;
    private final AccountService accountService;
    private final JdbcTemplate jdbc;
    @jakarta.persistence.PersistenceContext
    private jakarta.persistence.EntityManager entityManager;
    private static final BigDecimal MAX=new BigDecimal("99999999999999999.99");
    TransferService(AccountRepository accounts, TransferRepository transfers, AccountService accountService, JdbcTemplate jdbc) {
        this.accounts = accounts;
        this.transfers = transfers;
        this.accountService = accountService;
        this.jdbc = jdbc;
    }
    /** Transfers under deterministic account locks, replaying the same key without another debit.
     * @param email authenticated source owner
     * @param key stable operation key retained across retries
     * @param request destination and exact amount
     * @return committed receipt and whether newly created
     * @throws BankException for invalid destination, amount, funds or changed replay content
     */
    @Transactional
    public TransferResult transfer(String email,UUID key,TransferRequest request) {
        BigDecimal amount=parseAmount(request.amount());
        Account source=accountService.own(email);
        Account target=accounts.findByNumber(request.targetAccountNumber()).orElseThrow(
            ()->new BankException(404,"DESTINATION_NOT_FOUND","La cuenta destino no existe."));
        if(source.getId().equals(target.getId())) throw new BankException(400,"SAME_ACCOUNT","Elige una cuenta diferente a la tuya.");
        jdbc.execute("set local lock_timeout = '5s'");
        for(Long id: new TreeSet<>(List.of(source.getId(),target.getId()))) accounts.lock(id).orElseThrow();
        entityManager.refresh(source);
        entityManager.refresh(target);
        var prior=transfers.findBySourceIdAndIdempotencyKey(source.getId(),key);
        if(prior.isPresent()) {
            Transfer t=prior.get();
            if(!t.getTargetId().equals(target.getId())||t.getAmount().compareTo(amount)!=0)
                throw new BankException(409,"KEY_REUSED","Esta operación ya fue utilizada con otros datos.");
            return new TransferResult(receipt(t),false);
        }
        BigDecimal sourceBalance=jdbc.queryForObject("select balance from account where id=?",BigDecimal.class,source.getId());
        BigDecimal targetBalance=jdbc.queryForObject("select balance from account where id=?",BigDecimal.class,target.getId());
        if(sourceBalance.compareTo(amount)<0) throw new BankException(409,"INSUFFICIENT_FUNDS","El saldo es insuficiente.");
        if(targetBalance.add(amount).compareTo(MAX)>0) throw new BankException(400,"AMOUNT_LIMIT","El saldo destino excede el límite admitido.");
        source.setBalance(sourceBalance.subtract(amount));
        target.setBalance(targetBalance.add(amount));
        Transfer t=transfers.save(new Transfer(source.getId(),target.getId(),amount,key));
        accounts.flush();
        transfers.flush();
        return new TransferResult(receipt(t),true);
    }
    /** Retrieves a confirmed transfer by operation key for its source owner only.
     * @param email authenticated principal
     * @param key operation key
     * @return confirmed receipt
     * @throws BankException if no own committed operation is visible yet
     */
    @Transactional(readOnly=true)
    public TransferReceiptResponse byKey(String email,UUID key) {
        return receipt(transfers.findBySourceIdAndIdempotencyKey(accountService.own(email).getId(),key).orElseThrow(TransferService::notFound));
    }
    /** Retrieves a receipt only for a participating account owner.
     * @param email authenticated principal
     * @param id reference
     * @return confirmed receipt
     * @throws BankException for an absent or unrelated transfer
     */
    @Transactional(readOnly=true)
    public TransferReceiptResponse byReference(String email,UUID id) {
        Long accountId=accountService.own(email).getId();
        Transfer t=transfers.findById(id).orElseThrow(TransferService::notFound);
        if(!t.getSourceId().equals(accountId)&&!t.getTargetId().equals(accountId)) throw notFound();
        return receipt(t);
    }
    private TransferReceiptResponse receipt(Transfer t) {
        String from=accounts.findById(t.getSourceId()).orElseThrow().getNumber();
        String to=accounts.findById(t.getTargetId()).orElseThrow().getNumber();
        return new TransferReceiptResponse(t.getId(),t.getCreatedAt(),t.getAmount().toPlainString(),"COP","********"+from.substring(8),"********"+to.substring(8));
    }
    private static BigDecimal parseAmount(String value) {
        if(value==null||!value.matches("[0-9]{1,17}(\\.[0-9]{1,2})?"))
            throw new BankException(400,"AMOUNT_INVALID","Usa un monto positivo con hasta dos decimales.");
        BigDecimal amount=new BigDecimal(value).setScale(2);
        if(amount.signum()<=0) throw new BankException(400,"AMOUNT_INVALID","El monto debe ser mayor a cero.");
        return amount;
    }
    private static BankException notFound() { return new BankException(404,"NOT_FOUND","No se encontró la operación."); }
}

