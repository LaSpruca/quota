import 'dart:developer';

import 'package:flutter/cupertino.dart';
import 'package:quota/contants.dart';
import 'package:quota/supabase.dart';

class BooksModel extends ChangeNotifier {
  List<Book> _books = [];
  List<Book> get books {
    return _books;
  }

  bool _loading = false;
  bool get loading {
    return _loading;
  }

  Future<void> refresh(BuildContext context) async {
    _loading = true;

    try {
      var books =
          (await supabase.from("books").select<List<Map<String, dynamic>>>())
              .map(Book.fromSupabase)
              .toList();

      _books = books;
    } catch (ex) {
      log("Could not fetch books", error: ex);
      context.showSnackBar(message: "Cloud not fetch books");
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  void clear() {
    _books = [];
  }
}
