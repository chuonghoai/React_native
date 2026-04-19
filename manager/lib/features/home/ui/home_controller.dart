import 'package:flutter/material.dart';
import 'package:manager/features/home/service/category_service.dart';
import 'package:manager/features/home/service/dashboard_service.dart';
import 'package:manager/features/home/service/product_service.dart';
import 'package:manager/shared/models/product_model.dart';

class HomeController extends ChangeNotifier {
  final DashboardService _dashboardService;
  final ProductService _productService;
  final CategoryService _categoryService;

  HomeController(
    this._dashboardService,
    this._productService,
    this._categoryService,
  );

  // States
  bool isLoading = true;
  String? errorMessage;

  // Data
  Map<String, int> orderStats = {};
  double currentMonthRevenue = 0.0;
  int totalUsers = 0;

  List<ProductModel> recentProducts = [];
  List<ProductModel> lowStockProducts = [];
  List<CategoryModel> categories = [];

  Future<void> loadDashboardData() async {
    try {
      isLoading = true;
      errorMessage = null;
      notifyListeners();

      final now = DateTime.now();

      final results = await Future.wait([
        _dashboardService.getOrderStats(),
        _dashboardService.getRevenue(now.month, now.year),
        _dashboardService.getTotalUsers(),
        _productService.getProducts(page: 0, size: 5),
        _productService.getLowStockWarning(threshold: 10),
        _categoryService.getAllCategories(),
      ]);

      orderStats = results[0] as Map<String, int>;
      currentMonthRevenue = results[1] as double;
      totalUsers = results[2] as int;
      recentProducts = results[3] as List<ProductModel>;
      lowStockProducts = results[4] as List<ProductModel>;
      categories = results[5] as List<CategoryModel>;
    } catch (e) {
      errorMessage = e.toString();
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }
}
