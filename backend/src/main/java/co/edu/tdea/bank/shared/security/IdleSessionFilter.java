package co.edu.tdea.bank.shared.security;


import java.io.IOException;
import java.time.*;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/** Enforces the agreed 30-minute idle boundary, independently of container cleanup frequency. */
@Component @Order(-110)
class IdleSessionFilter extends OncePerRequestFilter {
    static final String LAST_ACTIVITY="bank.lastActivity";
    private final Clock clock;
    IdleSessionFilter(Clock clock) {this.clock=clock;}
    /** Invalidates an idle session before security reads it; no request is retried automatically.
     * @param request current HTTP request
     * @param response current HTTP response
     * @param chain remaining filters
     * @throws ServletException if downstream request processing fails
     * @throws IOException if response IO fails
     */
    @Override protected void doFilterInternal(HttpServletRequest request,HttpServletResponse response,FilterChain chain) throws ServletException,IOException {
        HttpSession session=request.getSession(false);
        if(session!=null) {
            Instant now=clock.instant();Object last=session.getAttribute(LAST_ACTIVITY);
            if(last instanceof Instant previous&&!now.isBefore(previous.plus(Duration.ofMinutes(30))))session.invalidate();
            else session.setAttribute(LAST_ACTIVITY,now);
        }
        chain.doFilter(request,response);
    }
}
