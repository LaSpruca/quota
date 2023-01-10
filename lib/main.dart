import 'package:flutter/material.dart';
import 'package:quota/pages/add_quote_page.dart';
import 'package:quota/pages/book_args_widget.dart';
import 'package:quota/pages/books_page.dart';
import 'package:quota/pages/book_page.dart';
import 'package:quota/pages/settings_page.dart';
import 'package:quota/supabase.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:quota/pages/login_page.dart';
import 'package:quota/pages/splash_page.dart';

Future<void> main() async {
  await Supabase.initialize(
    // TODO: Replace credentials with your own
    url: 'https://ruehdrpcjuuopfilxygv.supabase.co',
    anonKey:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1ZWhkcnBjanV1b3BmaWx4eWd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njk2MTE4MDMsImV4cCI6MTk4NTE4NzgwM30.S7EEHtjIm0lThHfVP4D8NEDGXMSrJx631p32jtnn8x4',
  );
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Quota',
      theme: ThemeData.dark(useMaterial3: true).copyWith(
        primaryColor: Colors.blue,
        textButtonTheme: TextButtonThemeData(
          style: TextButton.styleFrom(
            foregroundColor: Colors.blue,
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            foregroundColor: Colors.white,
            backgroundColor: Colors.blue,
          ),
        ),
      ),
      initialRoute: '/',
      routes: <String, WidgetBuilder>{
        '/': (_) => const SplashPage(),
        '/login': (_) => const LoginPage(),
        '/books': (_) => const BooksPage(),
        '/book': (_) => BookArgsExtractor(
            create: (book, _) => BookPage(
                  book: book,
                )),
        '/new-quote': (_) =>
            BookArgsExtractor(create: (book, _) => AddQuotePage(book: book)),
        '/settings': (_) =>
            BookArgsExtractor(create: (book, _) => SettingsPage(book: book))
      },
    );
  }
}
