package com.example.backend.service.Admin;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.VoucherRequest;
import com.example.backend.entities.Product;
import com.example.backend.entities.Voucher;
import com.example.backend.repositories.ProductRepository;
import com.example.backend.repositories.VoucherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminVoucherService {

    private final VoucherRepository voucherRepository;
    private final ProductRepository productRepository;

    public ApiResponse getAllVouchers() {
        List<Voucher> vouchers = voucherRepository.findAll();
        return ApiResponse.success("Lấy danh sách voucher thành công", vouchers);
    }

    public ApiResponse getVoucherById(Long id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Voucher"));
        return ApiResponse.success("Lấy voucher thành công", voucher);
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

        return ApiResponse.success("Thêm voucher thành công", voucherRepository.save(voucher));
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

        return ApiResponse.success("Cập nhật voucher thành công", voucherRepository.save(voucher));
    }

    public ApiResponse deleteVoucher(Long id) {
        if (!voucherRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy Voucher");
        }
        voucherRepository.deleteById(id);
        return ApiResponse.success("Xóa voucher thành công", null);
    }
}