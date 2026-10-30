package co.edu.tdea.bank.auth.controller;

import co.edu.tdea.bank.auth.dto.RegistrationRequest;
import co.edu.tdea.bank.auth.dto.LoginRequest;
import co.edu.tdea.bank.auth.dto.IdentityResponse;
import co.edu.tdea.bank.auth.service.AuthService;

import jakarta.servlet.http.*;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.authentication.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;

/** HTTP boundary for auth operations; business rules live in the application service. */
@RestController @RequestMapping("/api")
public class AuthController {
    private final AuthService bank;
    private final AuthenticationManager authentication;
    private final SecurityContextRepository contexts;
    AuthController(AuthService bank, AuthenticationManager authentication, SecurityContextRepository contexts) {
        this.bank = bank;
        this.authentication = authentication;
        this.contexts = contexts;
    }
    /** Issues a session CSRF token. Reacquire it after authentication changes.
     * @param token request's resolved CSRF token
     * @return header name and token; response must not be cached
     */
    @GetMapping("/auth/csrf")
    public ResponseEntity<Map<String,String>> csrf(CsrfToken token) {
        return ResponseEntity.ok().header("Cache-Control","no-store").body(Map.of("token",token.getToken(),"headerName",token.getHeaderName()));
    }
    /** Registers a new identity without logging it in.
     * @param body validated registration
     * @return HTTP 201 identity; 409 on duplicate email
     */
    @PostMapping("/auth/register")
    public ResponseEntity<IdentityResponse> register(@Valid @RequestBody RegistrationRequest body) {
        return ResponseEntity.status(201).body(bank.register(body));
    }
    /** Authenticates, rotates session ID and explicitly saves the security context.
     * @param body email and password
     * @param request current servlet request
     * @param response current response used to persist authentication
     * @return safe identity; invalid credentials produce 401
     */
    @PostMapping("/auth/login")
    public IdentityResponse login(@Valid @RequestBody LoginRequest body,HttpServletRequest request,HttpServletResponse response) {
        var result=authentication.authenticate(UsernamePasswordAuthenticationToken.unauthenticated(body.email(),body.password()));
        request.getSession();
        request.changeSessionId();
        var context=SecurityContextHolder.createEmptyContext(); context.setAuthentication(result);
        SecurityContextHolder.setContext(context);
        contexts.saveContext(context,request,response);
        request.getSession().removeAttribute("org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository.CSRF_TOKEN");
        return bank.identity(result.getName());
    }
    /** Invalidates the server session and expires its browser cookie.
     * @param request authenticated request
     * @param response response receiving cookie removal
     */
    @PostMapping("/auth/logout") @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
    public void logout(HttpServletRequest request,HttpServletResponse response) {
        var session=request.getSession(false); if(session!=null) session.invalidate();
        SecurityContextHolder.clearContext(); var cookie=new Cookie("JSESSIONID",""); cookie.setPath("/"); cookie.setMaxAge(0); cookie.setHttpOnly(true); response.addCookie(cookie);
    }
    /** Returns current identity.
     * @param principal authenticated owner
     * @return identity without credentials
     */
    @GetMapping("/auth/me") public IdentityResponse me(Principal principal) { return bank.identity(principal.getName()); }
}
