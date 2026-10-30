package co.edu.tdea.bank.shared.security;

import co.edu.tdea.bank.auth.entity.User;
import co.edu.tdea.bank.auth.repository.UserRepository;

import java.util.Locale;
import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.crypto.password.*;
import org.springframework.security.authentication.*;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.web.context.*;

/** Session-based REST security. CSRF stays enabled for all modifying requests. */
@Configuration
public class SecurityConfig {
    @Bean java.time.Clock clock() {return java.time.Clock.systemUTC();}
    /** Adaptive one-way hashing without password truncation.
     * @return the framework PBKDF2 encoder with its documented v5.8 parameters
     */
    @Bean PasswordEncoder passwordEncoder() { return Pbkdf2PasswordEncoder.defaultsForSpringSecurity_v5_8(); }
    @Bean UserDetailsService userDetails(UserRepository users) {
        return email -> {
            var u=users.findByEmail(email.trim().toLowerCase(Locale.ROOT)).orElseThrow(()->new UsernameNotFoundException("Invalid credentials"));
            return org.springframework.security.core.userdetails.User.withUsername(u.getEmail()).password(u.getPasswordHash()).roles("CUSTOMER").build();
        };
    }
    @Bean AuthenticationManager authenticationManager(UserDetailsService users,PasswordEncoder encoder) {
        var provider=new DaoAuthenticationProvider(users); provider.setPasswordEncoder(encoder);
        return new ProviderManager(provider);
    }
    @Bean SecurityContextRepository contextRepository() { return new HttpSessionSecurityContextRepository(); }
    @Bean SecurityFilterChain securityFilterChain(HttpSecurity http,SecurityContextRepository repository) throws Exception {
        http.csrf(csrf->csrf.csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler()))
            .securityContext(sc->sc.securityContextRepository(repository))
            .authorizeHttpRequests(auth->auth
                .requestMatchers("/api/auth/csrf","/api/auth/login","/api/auth/register","/error").permitAll()
                .requestMatchers("/api/**").authenticated().anyRequest().permitAll())
            .exceptionHandling(errors->errors
                .authenticationEntryPoint((req,res,e)->jsonError(res,401,"UNAUTHENTICATED","Inicia sesión para continuar."))
                .accessDeniedHandler((req,res,e)->{
                    var auth=org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                    boolean anonymous=auth==null||auth instanceof AnonymousAuthenticationToken;
                    int status=anonymous&&!req.getRequestURI().startsWith("/api/auth/")?401:403;
                    jsonError(res,status,status==401?"UNAUTHENTICATED":"CSRF_INVALID",status==401?"Inicia sesión para continuar.":"La sesión de seguridad cambió. Actualiza e inténtalo otra vez.");
                }))
            .formLogin(form->form.disable()).httpBasic(basic->basic.disable()).logout(logout->logout.disable());
        return http.build();
    }
    private static void jsonError(jakarta.servlet.http.HttpServletResponse response,int status,String code,String message) throws java.io.IOException {
        response.setStatus(status); response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"code\":\""+code+"\",\"message\":\""+message+"\",\"fieldErrors\":{}}");
    }
}

