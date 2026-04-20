import 'package:flutter/material.dart';
import 'package:manager/features/home/service/category_service.dart';
import 'package:manager/features/home/service/dashboard_service.dart';
import 'package:manager/features/home/service/product_service.dart';
import 'package:manager/shared/models/product_model.dart';

final HomeController homeControllerInstance = HomeController._singleton();

class HomeController extends ChangeNotifier {
  HomeController._singleton();
  HomeController();

  final DashboardService _dashboardService = DashboardService();
  final ProductService _productService = ProductService();
  final CategoryService _categoryService = CategoryService();

  // States
  bool isLoading = true;
  bool isFetchingMore = false;
  bool hasMoreProducts = true;
  String? errorMessage;

  // Data
  Map<String, int> orderStats = {};
  double currentMonthRevenue = 0.0;
  int totalUsers = 0;
  int newOrdersBadge = 0;

  List<CategoryModel> categories = [];
  List<ProductModel> recentProducts = [];
  List<ProductModel> lowStockProducts = [];

  int _currentPage = 0;
  final int _pageSize = 20;

  Future<void> loadDashboardData() async {
    try {
      isLoading = true;
      errorMessage = null;
      _currentPage = 0;
      hasMoreProducts = true;
      notifyListeners();

      final now = DateTime.now();

      final results = await Future.wait([
        _dashboardService.getOrderStats(),
        _dashboardService.getRevenue(now.month, now.year),
        _dashboardService.getTotalUsers(),
        _categoryService.getAllCategories(),
        _productService.getProducts(page: _currentPage, size: _pageSize),
        _productService.getLowStockWarning(threshold: 10),
      ]);

      orderStats = results[0] as Map<String, int>;
      newOrdersBadge = orderStats['NEW'] ?? 0;
      currentMonthRevenue = results[1] as double;
      totalUsers = results[2] as int;
      categories = results[3] as List<CategoryModel>;

      final products = results[4] as List<ProductModel>;
      recentProducts = products;
      if (products.length < _pageSize) hasMoreProducts = false;

      lowStockProducts = results[5] as List<ProductModel>;
    } catch (e) {
      errorMessage = e.toString();
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadMoreProducts() async {
    if (isFetchingMore || !hasMoreProducts || isLoading) return;

    try {
      isFetchingMore = true;
      notifyListeners();

      _currentPage++;
      final newProducts = await _productService.getProducts(
        page: _currentPage,
        size: _pageSize,
      );

      if (newProducts.isEmpty || newProducts.length < _pageSize) {
        hasMoreProducts = false;
      }

      recentProducts.addAll(newProducts);
    } catch (e) {
      _currentPage--;
    } finally {
      isFetchingMore = false;
      notifyListeners();
    }
  }

  void incrementNewOrdersCount({bool isIncrease = true}) {
    if (isIncrease) {
      newOrdersBadge += 1;
      orderStats['NEW'] = newOrdersBadge;
    } else {
      newOrdersBadge -= 1;
      orderStats['NEW'] = newOrdersBadge;
    }
    notifyListeners();
  }
}
