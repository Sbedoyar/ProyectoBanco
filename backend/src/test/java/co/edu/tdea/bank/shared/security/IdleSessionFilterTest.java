package co.edu.tdea.bank.shared.security;

import java.time.*;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import org.springframework.mock.web.*;

class IdleSessionFilterTest {
    @Test void expiresExactlyAtThirtyMinutesNotBefore() throws Exception {
        Instant start=Instant.parse("2026-10-24T00:00:00Z");var session=new MockHttpSession();
        session.setAttribute(IdleSessionFilter.LAST_ACTIVITY,start);
        var request=new MockHttpServletRequest();request.setSession(session);
        new IdleSessionFilter(Clock.fixed(start.plusSeconds(1799),ZoneOffset.UTC)).doFilter(request,new MockHttpServletResponse(),(req,res)->{});
        assertFalse(session.isInvalid());
        assertEquals(start.plusSeconds(1799),session.getAttribute(IdleSessionFilter.LAST_ACTIVITY));
        session.setAttribute(IdleSessionFilter.LAST_ACTIVITY,start);
        new IdleSessionFilter(Clock.fixed(start.plusSeconds(1800),ZoneOffset.UTC)).doFilter(request,new MockHttpServletResponse(),(req,res)->{});
        assertTrue(session.isInvalid());assertNull(request.getSession(false));
    }
}
