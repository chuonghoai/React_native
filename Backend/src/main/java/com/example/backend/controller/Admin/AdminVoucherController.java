package com.example.backend.controller.Admin;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.VoucherRequest;
import com.example.backend.service.Admin.AdminVoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/vouchers")
@RequiredArgsConstructor
public class AdminVoucherController {

    private final AdminVoucherService voucherService;

    @GetMapping
    public ApiResponse getAllVouchers() {
        return voucherService.getAllVouchers();
    }

    @GetMapping("/{id}")
    public ApiResponse getVoucherDetail(@PathVariable Long id) {
        return voucherService.getVoucherById(id);
    }

    @PostMapping
    public ApiResponse createVoucher(@RequestBody VoucherRequest request) {
        return voucherService.createVoucher(request);
    }

    @PatchMapping("/{id}")
    public ApiResponse updateVoucher(@PathVariable Long id, @RequestBody VoucherRequest request) {
        return voucherService.updateVoucher(id, request);
    }

    @DeleteMapping("/{id}")
    public ApiResponse deleteVoucher(@PathVariable Long id) {
        return voucherService.deleteVoucher(id);
    }
}