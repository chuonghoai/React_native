package com.example.backend.config;

import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;

import com.example.backend.JwtUtil;

@Component
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = resolveToken(accessor);
            if (token != null && !token.isBlank()) {
                String username = jwtUtil.extractSubject(token);
                accessor.setUser(new StompPrincipal(username));
            }
        }

        return message;
    }

    private String resolveToken(StompHeaderAccessor accessor) {
        List<String> authHeaders = accessor.getNativeHeader("Authorization");
        if (authHeaders == null || authHeaders.isEmpty()) {
            return null;
        }

        String authHeader = authHeaders.get(0);
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }

        return authHeader;
    }

    private record StompPrincipal(String name) implements Principal {
        @Override
        public String getName() {
            return name;
        }
    }
}
