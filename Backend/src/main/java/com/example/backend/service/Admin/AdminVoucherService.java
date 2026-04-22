package com.example.backend.service.Admin;

import com.example.backend.dto.AdminProductResponse;
import com.example.backend.dto.AdminVoucherResponse;
import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.VoucherRequest;
import com.example.backend.entities.Product;
import com.example.backend.entities.Voucher;
import com.example.backend.repositories.ProductRepository;
import com.example.backend.repositories.VoucherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminVoucherService {

    private final VoucherRepository voucherRepository;
    private final ProductRepository productRepository;
    private final AdminProductService adminProductService;

    private AdminVoucherResponse mapToResponse(Voucher voucher) {
        List<AdminProductResponse> productResponses = voucher.getProducts().stream()
                .map(adminProductService::mapToResponse)
                .collect(Collectors.toList());

        return AdminVoucherResponse.builder()
                .id(voucher.getId())
                .name(voucher.getName())
                .discountAmount(voucher.getDiscountAmount())
                .startDate(voucher.getStartDate())
                .endDate(voucher.getEndDate())
                .products(productResponses)
                .build();
    }

    public ApiResponse getAllVouchers() {
        List<AdminVoucherResponse> vouchers = voucherRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ApiResponse.success("Lấy danh sách voucher thành công", vouchers);
    }

    public ApiResponse getVoucherById(Long id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Voucher"));
        return ApiResponse.success("Lấy voucher thành công", mapToResponse(voucher));
    }

    public ApiResponse createVoucher(VoucherRequest request) {
        Voucher voucher = Voucher.builder()
                .name(request.getName())
                .discountAmount(request.getDiscountAmount())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .build();

        if (request.getProductIds() != null && !request.getProductIds().isEmpty()) {
            List<Product> products = productRepository.findAllById(request.getProductIds());
            voucher.setProducts(products);
        }

        Voucher savedVoucher = voucherRepository.save(voucher);
        return ApiResponse.success("Thêm voucher thành công", mapToResponse(savedVoucher));
    }

    public ApiResponse updateVoucher(Long id, VoucherRequest request) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Voucher"));

        voucher.setName(request.getName());
        voucher.setDiscountAmount(request.getDiscountAmount());
        voucher.setStartDate(request.getStartDate());
        voucher.setEndDate(request.getEndDate());

        if (request.getProductIds() != null) {
            List<Product> products = productRepository.findAllById(request.getProductIds());
            voucher.setProducts(products);
        } else {
            voucher.getProducts().clear();
        }

        Voucher updatedVoucher = voucherRepository.save(voucher);
        return ApiResponse.success("Cập nhật voucher thành công", mapToResponse(updatedVoucher));
    }

    public ApiResponse deleteVoucher(Long id) {
        if (!voucherRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy Voucher");
        }
        voucherRepository.deleteById(id);
        return ApiResponse.success("Xóa voucher thành công", null);
    }
}