package co.edu.tdea.bank;

import co.edu.tdea.bank.auth.dto.RegistrationRequest;
import co.edu.tdea.bank.auth.dto.LoginRequest;
import co.edu.tdea.bank.auth.dto.IdentityResponse;
import co.edu.tdea.bank.account.dto.AccountResponse;
import co.edu.tdea.bank.transfer.dto.TransferRequest;
import co.edu.tdea.bank.transfer.dto.TransferReceiptResponse;
import co.edu.tdea.bank.transfer.dto.TransferResult;
import co.edu.tdea.bank.movement.dto.MovementResponse;
import co.edu.tdea.bank.movement.dto.MovementPageResponse;
import co.edu.tdea.bank.shared.exception.ErrorResponse;
import co.edu.tdea.bank.auth.entity.User;
import co.edu.tdea.bank.auth.repository.UserRepository;
import co.edu.tdea.bank.account.entity.Account;
import co.edu.tdea.bank.account.repository.AccountRepository;
import co.edu.tdea.bank.transfer.entity.Transfer;
import co.edu.tdea.bank.transfer.repository.TransferRepository;
import co.edu.tdea.bank.auth.service.AuthService;
import co.edu.tdea.bank.account.service.AccountService;
import co.edu.tdea.bank.transfer.service.TransferService;
import co.edu.tdea.bank.movement.service.MovementService;
import co.edu.tdea.bank.movement.repository.MovementQueryRepository;
import co.edu.tdea.bank.shared.exception.BankException;

import static org.junit.jupiter.api.Assertions.*;
import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

@SpringBootTest
class BankIntegrationTest {
    @DynamicPropertySource static void properties(DynamicPropertyRegistry r) {
        String url=System.getenv("TEST_DB_URL");
        if(url==null||!url.matches("jdbc:postgresql://127\\.0\\.0\\.1:55432/bank_test"))
            throw new IllegalStateException("Tests require the dedicated loopback bank_test database.");
        r.add("spring.datasource.url",()->url);
        r.add("spring.datasource.username",()->System.getenv("TEST_DB_USERNAME"));
        r.add("spring.datasource.password",()->System.getenv("TEST_DB_PASSWORD"));
        r.add("spring.profiles.active",()->"test");
    }
    @Autowired AuthService auth;
    @Autowired AccountService account;
    @Autowired TransferService transfer;
    @Autowired MovementService movement;
    @Autowired JdbcTemplate jdbc;
    String source,target,third;
    @BeforeEach void reset() {
        assertEquals("bank_test",jdbc.queryForObject("select current_database()",String.class));
        assertEquals("bank_test",jdbc.queryForObject("select current_user",String.class));
        jdbc.execute("drop trigger if exists fail_credit on account");
        jdbc.execute("truncate bank_transfer, opening_movement, account, app_user restart identity cascade");
        jdbc.execute("alter sequence account_number_seq restart with 100000000001");
        auth.register(new RegistrationRequest("Ana","ana@example.test","Academia2026!"));
        auth.register(new RegistrationRequest("Luis","luis@example.test","Academia2026!"));
        auth.register(new RegistrationRequest("Eva","eva@example.test","Academia2026!"));
        source=account.account("ana@example.test").number(); target=account.account("luis@example.test").number(); third=account.account("eva@example.test").number();
    }
    @Test void registrationCreatesOneOpeningAndDuplicateCannotMintMoney() {
        assertEquals("1000000.00",account.account("ana@example.test").balance());
        assertThrows(BankException.class,()->auth.register(new RegistrationRequest("Ana"," ANA@example.test ","Academia2026!")));
        assertEquals(3,jdbc.queryForObject("select count(*) from account",Integer.class));
        assertEquals(3,jdbc.queryForObject("select count(*) from opening_movement",Integer.class));
        assertFalse(jdbc.queryForObject("select password_hash from app_user where email='ana@example.test'",String.class).contains("Academia2026!"));
    }
    @Test void transferAndReplayHaveOneReferenceAndExactBalances() {
        UUID key=UUID.randomUUID(); var request=new TransferRequest(target,"150000");
        var first=transfer.transfer("ana@example.test",key,request);
        var second=transfer.transfer("ana@example.test",key,request);
        assertTrue(first.created());assertFalse(second.created());assertEquals(first.receipt(),second.receipt());
        assertEquals("850000.00",account.account("ana@example.test").balance());
        assertEquals("1150000.00",account.account("luis@example.test").balance());
        assertEquals(1,jdbc.queryForObject("select count(*) from bank_transfer",Integer.class));
        assertEquals(first.receipt(),transfer.byKey("ana@example.test",key));
    }
    @Test void invalidAmountsAndDestinationsHaveNoEffects() {
        for(String value:List.of("0","-1","0.001","1.230","NaN","1e3","1000000.01")) {
            assertThrows(BankException.class,()->transfer.transfer("ana@example.test",UUID.randomUUID(),new TransferRequest(target,value)));
        }
        assertThrows(BankException.class,()->transfer.transfer("ana@example.test",UUID.randomUUID(),new TransferRequest(source,"1")));
        assertThrows(BankException.class,()->transfer.transfer("ana@example.test",UUID.randomUUID(),new TransferRequest("999999999999","1")));
        assertEquals("1000000.00",account.account("ana@example.test").balance());
        assertEquals(0,jdbc.queryForObject("select count(*) from bank_transfer",Integer.class));
    }
    @Test void exactDecimalsAndFullBalanceDoNotRound() {
        transfer.transfer("ana@example.test",UUID.randomUUID(),new TransferRequest(target,"0.01"));
        assertEquals("999999.99",account.account("ana@example.test").balance());
        transfer.transfer("ana@example.test",UUID.randomUUID(),new TransferRequest(target,"999999.99"));
        assertEquals("0.00",account.account("ana@example.test").balance());
        assertEquals("2000000.00",account.account("luis@example.test").balance());
    }
    @Test void changedContentOnSameKeyIsRejected() {
        var key=UUID.randomUUID();transfer.transfer("ana@example.test",key,new TransferRequest(target,"10"));
        assertThrows(BankException.class,()->transfer.transfer("ana@example.test",key,new TransferRequest(target,"11")));
        assertThrows(BankException.class,()->transfer.transfer("ana@example.test",key,new TransferRequest(third,"10")));
        assertEquals("999990.00",account.account("ana@example.test").balance());
    }
    @Test void concurrentSpendingCannotOverdraw() throws Exception {
        var result=parallel(UUID.randomUUID(),UUID.randomUUID(),"700000");
        assertEquals(1,result.stream().filter(Boolean::booleanValue).count());
        assertEquals("300000.00",account.account("ana@example.test").balance());
        assertEquals(1,jdbc.queryForObject("select count(*) from bank_transfer",Integer.class));
        assertEquals(0,new BigDecimal("3000000.00").compareTo(jdbc.queryForObject("select sum(balance) from account",BigDecimal.class)));
    }
    @Test void concurrentReplayDebitsOnlyOnce() throws Exception {
        UUID key=UUID.randomUUID(); var result=parallel(key,key,"700000");
        assertEquals(2,result.stream().filter(Boolean::booleanValue).count());
        assertEquals("300000.00",account.account("ana@example.test").balance());
        assertEquals(1,jdbc.queryForObject("select count(*) from bank_transfer",Integer.class));
    }
    @Test void forcedDatabaseFailureRollsBackBothBalancesAndReceipt() {
        jdbc.execute("create or replace function fail_credit_test() returns trigger language plpgsql as 'begin if NEW.balance > OLD.balance then raise exception ''test credit failure''; end if; return NEW; end'");
        jdbc.execute("create trigger fail_credit before update on account for each row execute function fail_credit_test()");
        try {assertThrows(RuntimeException.class,()->transfer.transfer("ana@example.test",UUID.randomUUID(),new TransferRequest(target,"100")));}
        finally {jdbc.execute("drop trigger fail_credit on account");}
        assertEquals("1000000.00",account.account("ana@example.test").balance());
        assertEquals("1000000.00",account.account("luis@example.test").balance());
        assertEquals(0,jdbc.queryForObject("select count(*) from bank_transfer",Integer.class));
    }
    @Test void historyAndReceiptsAreScopedToParticipants() {
        UUID key=UUID.randomUUID();var receipt=transfer.transfer("ana@example.test",key,new TransferRequest(target,"100")).receipt();
        assertEquals("SENT",movement.movements("ana@example.test",0,20).items().getFirst().type());
        assertEquals("RECEIVED",movement.movements("luis@example.test",0,20).items().getFirst().type());
        assertEquals(1,movement.movements("eva@example.test",0,20).items().size());
        assertThrows(BankException.class,()->transfer.byReference("eva@example.test",receipt.reference()));
        assertThrows(BankException.class,()->transfer.byKey("luis@example.test",key));
        assertEquals("********0001",receipt.sourceAccountMasked());
        assertEquals("********0002",receipt.targetAccountMasked());
    }
    @Test void oppositeTransfersUseTheSameLockOrder() throws Exception {
        try(var executor=Executors.newFixedThreadPool(2)) {
            var start=new CountDownLatch(1);
            var a=executor.submit(()->{start.await();return transfer.transfer("ana@example.test",UUID.randomUUID(),new TransferRequest(target,"100"));});
            var b=executor.submit(()->{start.await();return transfer.transfer("luis@example.test",UUID.randomUUID(),new TransferRequest(source,"100"));});
            start.countDown();assertTrue(a.get(15,TimeUnit.SECONDS).created());assertTrue(b.get(15,TimeUnit.SECONDS).created());
        }
        assertEquals("1000000.00",account.account("ana@example.test").balance());
        assertEquals("1000000.00",account.account("luis@example.test").balance());
    }
    @Test void destinationOverflowRejectsWithoutDebitingSource() {
        jdbc.update("update account set balance=99999999999999999.99 where number=?",target);
        assertThrows(BankException.class,()->transfer.transfer("ana@example.test",UUID.randomUUID(),new TransferRequest(target,"1")));
        assertEquals("1000000.00",account.account("ana@example.test").balance());
        assertEquals(0,jdbc.queryForObject("select count(*) from bank_transfer",Integer.class));
    }
    @Test void registrationFailureRollsBackIdentityAndAccount() {
        jdbc.execute("create or replace function fail_opening_test() returns trigger language plpgsql as 'begin raise exception ''test opening failure''; end'");
        jdbc.execute("create trigger fail_opening before insert on opening_movement for each row execute function fail_opening_test()");
        try {assertThrows(RuntimeException.class,()->auth.register(new RegistrationRequest("Registro fallido","fail@example.test","Academia2026!")));}
        finally {jdbc.execute("drop trigger fail_opening on opening_movement");}
        assertEquals(0,jdbc.queryForObject("select count(*) from app_user where email='fail@example.test'",Integer.class));
        assertEquals(3,jdbc.queryForObject("select count(*) from account",Integer.class));
        assertEquals(3,jdbc.queryForObject("select count(*) from opening_movement",Integer.class));
    }
    @Test void concurrentRegistrationCannotCreateTwoAccounts() throws Exception {
        try(var executor=Executors.newFixedThreadPool(2)) {
            var start=new CountDownLatch(1);List<Future<Boolean>> result=new ArrayList<>();
            for(int n=0;n<2;n++)result.add(executor.submit(()->{start.await();try{auth.register(new RegistrationRequest("Nuevo","concurrent@example.test","Academia2026!"));return true;}catch(BankException e){if(!e.code.equals("EMAIL_EXISTS"))throw e;return false;}catch(org.springframework.dao.DataIntegrityViolationException e){return false;}}));
            start.countDown();assertNotEquals(result.get(0).get(15,TimeUnit.SECONDS),result.get(1).get(15,TimeUnit.SECONDS));
        }
        assertEquals(4,jdbc.queryForObject("select count(*) from app_user",Integer.class));
        assertEquals(4,jdbc.queryForObject("select count(*) from account",Integer.class));
        assertEquals(4,jdbc.queryForObject("select count(*) from opening_movement",Integer.class));
    }
    private List<Boolean> parallel(UUID first,UUID second,String amount) throws Exception {
        var ready=new CountDownLatch(2);var start=new CountDownLatch(1);
        try(var executor=Executors.newFixedThreadPool(2)) {
            List<Future<Boolean>> futures=new ArrayList<>();
            for(UUID key:List.of(first,second))futures.add(executor.submit(()->{ready.countDown();start.await();try{transfer.transfer("ana@example.test",key,new TransferRequest(target,amount));return true;}catch(BankException e){if(!e.code.equals("INSUFFICIENT_FUNDS"))throw e;return false;}}));
            assertTrue(ready.await(5,TimeUnit.SECONDS));start.countDown();
            return List.of(futures.get(0).get(15,TimeUnit.SECONDS),futures.get(1).get(15,TimeUnit.SECONDS));
        }
    }
}


