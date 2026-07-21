package com.prayertracker.patternviewer.config;

import com.prayertracker.patternviewer.security.CurrentUserArgumentResolver;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    //! WebConfig adds app-wide web behavior like CORS and custom request helpers.
    //! WebConfig tambah behavior web untuk seluruh app macam CORS dan helper request custom.
    private final CurrentUserArgumentResolver currentUserArgumentResolver;

    public WebConfig(CurrentUserArgumentResolver currentUserArgumentResolver) {
        this.currentUserArgumentResolver = currentUserArgumentResolver;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        //! CORS allows the React dev server on port 5173 to call this backend during development.
        //! CORS bagi frontend React di port 5173 call backend ni masa development.
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173", "http://127.0.0.1:5173")
                .allowedMethods("*")
                .allowedHeaders("*");
    }

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        //? This lets controller methods use @CurrentUser without manually reading the token every time.
        //? Ni bagi method controller guna @CurrentUser tanpa baca token manual setiap kali.
        resolvers.add(currentUserArgumentResolver);
    }
}
