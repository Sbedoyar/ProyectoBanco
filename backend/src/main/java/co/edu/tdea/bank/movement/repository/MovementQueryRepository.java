package co.edu.tdea.bank.movement.repository;

import co.edu.tdea.bank.movement.dto.MovementResponse;
import co.edu.tdea.bank.movement.dto.MovementPageResponse;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
/** Own-account history read model; UNION preserves opening and transfer ordering. */
@Repository
public class MovementQueryRepository {
    private final JdbcTemplate jdbc;
    MovementQueryRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }
    /** Reads a bounded history page within the caller's read-only transaction.
     * @param id trusted own account ID
     * @param page validated zero-based page
     * @param size validated size between one and 100
     * @return own movements in stable descending order
     */
    public MovementPageResponse findByAccount(Long id, int page, int size) {
        var list=jdbc.query("""
            select * from (
              select 'opening-'||o.account_id as id,'OPENING' as type,null::uuid as reference,
                o.amount,o.created_at,'—' as counterparty from opening_movement o where o.account_id=?
              union all
              select t.id::text,case when t.source_id=? then 'SENT' else 'RECEIVED' end,t.id,t.amount,t.created_at,
                '********'||right(a.number,4) from bank_transfer t join account a
                on a.id=case when t.source_id=? then t.target_id else t.source_id end
                where t.source_id=? or t.target_id=?
            ) m order by created_at desc,id desc limit ? offset ?
            """,(rs,n)->new MovementResponse(rs.getString("id"),rs.getString("type"),rs.getObject("reference",UUID.class),
                rs.getBigDecimal("amount").toPlainString(),"COP",rs.getTimestamp("created_at").toInstant(),rs.getString("counterparty")),
            id,id,id,id,id,size+1,page*size);
        return new MovementPageResponse(list.stream().limit(size).toList(),page,size,list.size()>size);
    }
}
