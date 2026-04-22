// ignore_for_file: use_super_parameters

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:manager/core/utils/image_url_helper.dart';
import 'package:manager/features/product/ui/product_controller.dart';
import 'package:manager/shared/models/product_model.dart';

class ProductScreen extends StatefulWidget {
  final int productId;
  const ProductScreen({Key? key, required this.productId}) : super(key: key);

  @override
  State<ProductScreen> createState() => _ProductScreenState();
}

class _ProductScreenState extends State<ProductScreen> {
  final ProductController _controller = ProductController();

  @override
  void initState() {
    super.initState();
    _controller.fetchProductDetail(widget.productId);
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: _controller,
      builder: (context, _) {
        final p = _controller.currentProduct;

        return Scaffold(
          appBar: AppBar(
            title: const Text('Chi tiết sản phẩm'),
            actions: [
              if (p != null)
                IconButton(
                  icon: const Icon(Icons.edit),
                  onPressed: () async {
                    final result = await Navigator.pushNamed(
                      context,
                      '/product-edit',
                      arguments: p,
                    );

                    if (result == true) {
                      _controller.fetchProductDetail(widget.productId);
                    }
                  },
                ),
            ],
          ),
          body: RefreshIndicator(
            onRefresh: () => _controller.fetchProductDetail(widget.productId),
            child: _controller.isLoading
                ? const Center(child: CircularProgressIndicator())
                : p == null
                ? const SingleChildScrollView(
                    physics: AlwaysScrollableScrollPhysics(),
                    child: SizedBox(
                      height: 400,
                      child: Center(child: Text('Không tìm thấy sản phẩm')),
                    ),
                  )
                : SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          height: 300,
                          width: double.infinity,
                          color: Colors.grey[200],
                          child: ImageUrlHelper.buildUrl(p.imageUrl) != null
                              ? Image.network(
                                  ImageUrlHelper.buildUrl(p.imageUrl)!,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) => const Icon(
                                    Icons.broken_image,
                                    size: 100,
                                    color: Colors.grey,
                                  ),
                                )
                              : const Icon(
                                  Icons.image,
                                  size: 100,
                                  color: Colors.grey,
                                ),
                        ),
                        Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                p.name,
                                style: const TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                NumberFormat.currency(
                                  locale: 'vi_VN',
                                  symbol: 'đ',
                                ).format(p.price),
                                style: const TextStyle(
                                  fontSize: 20,
                                  color: Colors.red,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const Divider(height: 32),
                              _buildInfoRow(
                                Icons.shopping_bag_outlined,
                                'Đã bán:',
                                '${p.soldCount ?? 0}',
                              ),
                              _buildInfoRow(
                                Icons.inventory_2_outlined,
                                'Tồn kho:',
                                '${p.quantity}',
                                isHighlight: true,
                              ),
                              _buildInfoRow(
                                Icons.category_outlined,
                                'Danh mục:',
                                p.category?.name ?? 'Chưa phân loại',
                              ),
                              const SizedBox(height: 16),
                              const Text(
                                'Mô tả sản phẩm',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                p.description ?? 'Không có mô tả',
                                style: const TextStyle(
                                  fontSize: 16,
                                  color: Colors.black87,
                                ),
                              ),

                              const SizedBox(height: 32),
                              const Divider(
                                thickness: 4,
                                color: Color(0xFFF5F5F5),
                              ),
                              const SizedBox(height: 16),

                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text(
                                    'Đánh giá từ khách hàng',
                                    style: TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Text(
                                    '(${p.reviews?.length ?? 0})',
                                    style: const TextStyle(
                                      fontSize: 16,
                                      color: Colors.grey,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16),

                              _buildReviewList(p.reviews),

                              const SizedBox(height: 40),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
          ),
        );
      },
    );
  }

  Widget _buildInfoRow(
    IconData icon,
    String label,
    String value, {
    bool isHighlight = false,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(icon, size: 20, color: Colors.grey),
          const SizedBox(width: 8),
          Text(label, style: const TextStyle(fontSize: 16, color: Colors.grey)),
          const SizedBox(width: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: isHighlight ? Colors.blue : Colors.black,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReviewList(List<ReviewModel>? reviews) {
    if (reviews == null || reviews.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(24),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: Colors.grey.shade50,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: Colors.grey.shade200,
            style: BorderStyle.none,
          ),
        ),
        child: Column(
          children: [
            Icon(
              Icons.rate_review_outlined,
              size: 40,
              color: Colors.grey.shade400,
            ),
            const SizedBox(height: 8),
            Text(
              'Chưa có đánh giá nào.',
              style: TextStyle(color: Colors.grey.shade600),
            ),
          ],
        ),
      );
    }

    return ListView.separated(
      shrinkWrap:
          true,
      physics:
          const NeverScrollableScrollPhysics(),
      itemCount: reviews.length,
      separatorBuilder: (context, index) => const Divider(height: 24),
      itemBuilder: (context, index) {
        final review = reviews[index];
        return _buildReviewItem(review);
      },
    );
  }

  Widget _buildReviewItem(ReviewModel review) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            CircleAvatar(
              radius: 18,
              backgroundColor: Colors.blue.shade100,
              backgroundImage: review.avatarUrl.isNotEmpty
                  ? NetworkImage(review.avatarUrl)
                  : null,
              child: review.avatarUrl.isEmpty
                  ? Text(
                      (review.fullname.isNotEmpty)
                          ? review.fullname[0].toUpperCase()
                          : 'U',
                      style: TextStyle(
                        color: Colors.blue.shade800,
                        fontWeight: FontWeight.bold,
                      ),
                    )
                  : null,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    review.fullname,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: List.generate(5, (index) {
                      return Icon(
                        index < review.rating ? Icons.star : Icons.star_border,
                        size: 14,
                        color: Colors.amber,
                      );
                    }),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        if (review.comment.isNotEmpty)
          Text(
            review.comment,
            style: const TextStyle(
              fontSize: 14,
              color: Colors.black87,
              height: 1.4,
            ),
          ),
      ],
    );
  }
}
