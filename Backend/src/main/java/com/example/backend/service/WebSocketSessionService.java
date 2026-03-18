package com.example.backend.service;

import java.security.Principal;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.messaging.SessionConnectedEvent;

@Service
public class WebSocketSessionService {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketSessionService.class);

    @EventListener
    public void handleSessionConnected(SessionConnectedEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = accessor.getUser();
        String username = principal != null ? principal.getName() : "anonymous";

        logger.info("WebSocket connected: user {} is now online", username);
        System.out.println("WebSocket connected: user " + username + " is now online");
    }
}
