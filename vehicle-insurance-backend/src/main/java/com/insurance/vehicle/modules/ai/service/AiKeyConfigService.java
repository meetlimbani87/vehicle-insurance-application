package com.insurance.vehicle.modules.ai.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AiKeyConfigService {

    @Value("${openai.api-key:}")
    private String defaultApiKey;

    @Value("${openai.model:gpt-4o-mini}")
    private String defaultModel;

    private String dynamicApiKey;
    private String provider = "OpenAI";
    private String model = "gpt-4o";

    public String getApiKey() {
        if (dynamicApiKey != null && !dynamicApiKey.isBlank()) {
            return dynamicApiKey;
        }
        return defaultApiKey;
    }

    public void setApiKey(String key, String provider, String model) {
        if (key != null) {
            this.dynamicApiKey = key.trim();
        }
        if (provider != null && !provider.isBlank()) {
            this.provider = provider.trim();
        }
        if (model != null && !model.isBlank()) {
            this.model = model.trim();
        }
    }

    public void clearApiKey() {
        this.dynamicApiKey = null;
    }

    public boolean isConfigured() {
        String key = getApiKey();
        return key != null && !key.isBlank();
    }

    public String getProvider() {
        return provider;
    }

    public String getModel() {
        return model;
    }

    /**
     * Safely masks the API key so the raw secret is NEVER exposed over HTTP or DevTools.
     * e.g., "sk-proj-1234567890abcdef" -> "sk-proj-••••••••••••cdef"
     */
    public String getMaskedKey() {
        String key = getApiKey();
        if (key == null || key.isBlank()) {
            return null;
        }
        if (key.length() <= 8) {
            return "••••••••";
        }
        String prefix = key.substring(0, Math.min(7, key.length() - 4));
        String suffix = key.substring(key.length() - 4);
        return prefix + "••••••••••••" + suffix;
    }
}
