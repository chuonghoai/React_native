// ignore_for_file: use_super_parameters

import 'package:flutter/material.dart';
import '../../../product/ui/product_add_screen.dart';

class AddProductBubble extends StatelessWidget {
  final VoidCallback onProductAdded;

  const AddProductBubble({Key? key, required this.onProductAdded})
    : super(key: key);

  @override
  Widget build(BuildContext context) {
    return FloatingActionButton(
      onPressed: () async {
        final result = await Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => const ProductAddScreen()),
        );

        if (result == true) {
          onProductAdded();
        }
      },
      backgroundColor: Colors.blueAccent,
      elevation: 6,
      shape: const CircleBorder(),
      child: const Icon(Icons.add, color: Colors.white, size: 32),
    );
  }
}
