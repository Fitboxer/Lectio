package com.lectio.api.config;

import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI lectioOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Lectio API")
                        .description("API REST para la gestión de libros, usuarios y biblioteca personal en la aplicación Lectio.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Lectio")
                                .email("soporte@lectio.local")
                        )
                        .license(new License()
                                .name("Uso académico")
                                .url("https://www.example.com/licencia")))
                .externalDocs(new ExternalDocumentation()
                        .description("Memoria del proyecto Lectio")
                        .url("https://www.example.com/memoria"));
    }
}
