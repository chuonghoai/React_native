package com.example.backend.dto;

import java.util.List;

import com.example.backend.entities.Category;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserMeResponse {
    private Long id;
    private String email;
    private String fullname;
    private String username;
    private String role;
    private String phone;
    private String avatarUrl;
    private List<Category> categories;
}
