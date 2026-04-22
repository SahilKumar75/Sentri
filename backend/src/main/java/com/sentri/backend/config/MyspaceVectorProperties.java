package com.sentri.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "sentri.myspace.vector")
public class MyspaceVectorProperties {

    private boolean enabled = true;
    private int dimension = 384;
    private int maxSearchLimit = 20;
    private String distanceMetric = "cosine";

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public int getDimension() {
        return dimension;
    }

    public void setDimension(int dimension) {
        this.dimension = dimension;
    }

    public int getMaxSearchLimit() {
        return maxSearchLimit;
    }

    public void setMaxSearchLimit(int maxSearchLimit) {
        this.maxSearchLimit = maxSearchLimit;
    }

    public String getDistanceMetric() {
        return distanceMetric;
    }

    public void setDistanceMetric(String distanceMetric) {
        this.distanceMetric = distanceMetric;
    }
}
