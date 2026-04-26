package com.sentri.backend.config;

import org.neo4j.driver.AuthTokens;
import org.neo4j.driver.Driver;
import org.neo4j.driver.GraphDatabase;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class Neo4jDriverConfig {

    @Bean(destroyMethod = "close")
    @ConditionalOnProperty(prefix = "sentri.myspace.graph", name = "enabled", havingValue = "true")
    Driver neo4jDriver(MyspaceGraphProperties properties) {
        return GraphDatabase.driver(
                properties.uri(),
                AuthTokens.basic(properties.username(), properties.password())
        );
    }
}
