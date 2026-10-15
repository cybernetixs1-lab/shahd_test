import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'data/app_database.dart';
import 'data/waitlist_repository.dart';
import 'state/waitlist_controller.dart';
import 'ui/waitlist_screen.dart';

Future<void> main() async {
  // Required because sqflite (a plugin) is used before runApp.
  WidgetsFlutterBinding.ensureInitialized();
  final database = await openAppDatabase();

  runApp(
    // Above MaterialApp so routes such as the add sheet can read the controller.
    ChangeNotifierProvider(
      create: (_) => WaitlistController(WaitlistRepository(database))..load(),
      child: const WaitlistApp(),
    ),
  );
}

class WaitlistApp extends StatelessWidget {
  const WaitlistApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Waitlist',
      theme: ThemeData(colorSchemeSeed: Colors.indigo),
      home: const WaitlistScreen(),
    );
  }
}
