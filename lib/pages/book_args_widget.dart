import 'package:flutter/cupertino.dart';
import 'package:quota/supabase.dart';

class BookArgs {
  final Book book;

  BookArgs(this.book);
}

class BookArgsExtractor extends StatelessWidget {
  final Function(Book book, BuildContext context) create;
  const BookArgsExtractor({super.key, required this.create});

  @override
  Widget build(BuildContext context) {
    var args = ModalRoute.of(context)!.settings.arguments as BookArgs;
    return create(args.book, context);
  }
}
