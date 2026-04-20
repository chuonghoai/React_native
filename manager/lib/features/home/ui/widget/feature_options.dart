// ignore_for_file: use_super_parameters

import 'package:flutter/material.dart';
import 'package:manager/features/category/ui/category_screen.dart';

class FeatureOptions extends StatelessWidget {
  const FeatureOptions({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          const DrawerHeader(
            decoration: BoxDecoration(color: Colors.blueAccent),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Icon(Icons.dashboard_customize, color: Colors.white, size: 40),
                SizedBox(height: 12),
                Text(
                  'Quản lý mở rộng',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),

          ListTile(
            leading: const Icon(Icons.category, color: Colors.blueAccent),
            title: const Text('Danh mục', style: TextStyle(fontSize: 16)),
            onTap: () {
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const CategoryScreen()),
              );
            },
          ),
          ListTile(
            leading: const Icon(Icons.local_offer, color: Colors.blueAccent),
            title: const Text('Khuyến mãi', style: TextStyle(fontSize: 16)),
            onTap: () {
              // TODO:
              Navigator.pop(context);
            },
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.settings, color: Colors.grey),
            title: const Text('Cài đặt', style: TextStyle(fontSize: 16)),
            onTap: () {
              // TODO:
              Navigator.pop(context);
            },
          ),
        ],
      ),
    );
  }
}
