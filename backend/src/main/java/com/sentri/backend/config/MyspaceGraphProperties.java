package com.sentri.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "sentri.myspace.graph")
public record MyspaceGraphProperties(
        boolean enabled,
        String uri,
        String username,
        String password,
        String database,
        int maxRelatedLimit
) {
}
