package com.example.backend.service.Admin;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend.dto.ApiResponse;
import com.example.backend.entities.Category;
import com.example.backend.repositories.CategoryRepository;

@Service
public class AdminCategoryService {

    @Autowired private CategoryRepository categoryRepository;

    public ApiResponse getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return ApiResponse.success("Lấy danh sách danh mục thành công", categories);
    }
}