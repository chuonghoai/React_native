package com.example.backend.service.Admin;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.CategoryRequest;
import com.example.backend.entities.Category;
import com.example.backend.repositories.CategoryRepository;

@Service
public class AdminCategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public ApiResponse getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return ApiResponse.success("Lấy danh sách danh mục thành công", categories);
    }

    public ApiResponse createCategory(CategoryRequest request) {
        Category category = Category.builder()
                .name(request.getName())
                .build();
        return ApiResponse.success("Thêm danh mục thành công", categoryRepository.save(category));
    }

    public ApiResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));

        category.setName(request.getName());
        return ApiResponse.success("Cập nhật danh mục thành công", categoryRepository.save(category));
    }

    public ApiResponse deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy danh mục");
        }
        categoryRepository.deleteById(id);
        return ApiResponse.success("Xóa danh mục thành công", null);
    }
}