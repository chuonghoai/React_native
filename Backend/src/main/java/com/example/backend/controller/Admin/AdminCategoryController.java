package com.example.backend.controller.Admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.ApiResponse;
import com.example.backend.service.Admin.AdminCategoryService;

@RestController
@RequestMapping("/api/admin/categories")
@CrossOrigin
public class AdminCategoryController {

    @Autowired
    private AdminCategoryService adminCategoryService;

    @GetMapping
    public ApiResponse getAllCategories() {
        return adminCategoryService.getAllCategories();
    }
}