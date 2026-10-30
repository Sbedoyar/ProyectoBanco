package co.edu.tdea.bank.shared.exception;


/** Expected business rejection that rolls back the current transaction. */
public class BankException extends RuntimeException {
    public final int status;
    public final String code;
    /** Represents an expected rejection while preserving transaction rollback.
     * @param status HTTP status exposed by the error boundary
     * @param code stable machine-readable business code
     * @param message safe user-facing explanation without infrastructure details
     */
    public BankException(int status,String code,String message) { super(message);
        this.status=status;
        this.code=code; }
}
