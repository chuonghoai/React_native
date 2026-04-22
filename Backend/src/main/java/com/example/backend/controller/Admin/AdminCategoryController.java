package com.example.backend.controller.Admin;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.CategoryRequest;
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

    @PostMapping
    public ApiResponse createCategory(@RequestBody CategoryRequest request) {
        return adminCategoryService.createCategory(request);
    }

    @PatchMapping("/{id}")
    public ApiResponse updateCategory(@PathVariable Long id, @RequestBody CategoryRequest request) {
        return adminCategoryService.updateCategory(id, request);
    }

    @DeleteMapping("/{id}")
    public ApiResponse deleteCategory(@PathVariable Long id) {
        return adminCategoryService.deleteCategory(id);
    }
}