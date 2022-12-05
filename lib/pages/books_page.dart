import 'package:flutter/material.dart';
import 'package:quota/pages/book_args_widget.dart';
import 'package:quota/pages/book_page.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../contants.dart';
import '../supabase.dart';

class BooksPage extends StatefulWidget {
  const BooksPage({super.key});

  @override
  State<BooksPage> createState() => _BooksPageState();
}

class _BooksPageState extends State<BooksPage> {
  List<Book> books = [];

  Future<void> _signOut() async {
    try {
      await supabase.auth.signOut();
    } on AuthException catch (error) {
      context.showErrorSnackBar(message: error.message);
    } catch (error) {
      context.showErrorSnackBar(message: 'Unexpected error occurred');
    }
    if (mounted) {
      Navigator.of(context).pushReplacementNamed('/');
    }
  }

  Future<void> _getBooks() async {
    try {
      print("Getting books");

      var books =
          (await supabase.from("books").select<List<Map<String, dynamic>>>())
              .map((map) => Book(
                  ownerEmail: map["owner_email"],
                  owner: map["owner"],
                  id: map["id"]))
              .toList();

      setState(() {
        this.books = books;
      });
    } catch (ex) {
      print(ex);
      if (mounted) {
        context.showSnackBar(message: "Cloud not fetch books");
      }
    }
  }

  @override
  void initState() {
    super.initState();
    _getBooks();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(title: const Text("Select book"), actions: [
          Padding(
            padding: const EdgeInsets.all(10.0),
            child: ElevatedButton.icon(
                onPressed: _signOut,
                icon: const Icon(Icons.logout),
                label: const Text("Logout"),
                style: const ButtonStyle(
                    backgroundColor:
                        MaterialStatePropertyAll<Color>(Colors.red))),
          )
        ]),
        body: Container(
          width: MediaQuery.of(context).size.width,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: books
                .map((book) => Card(
                      child: Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: Column(children: [
                          RichText(
                              text: TextSpan(children: [
                            TextSpan(
                                text: book.ownerEmail,
                                style: const TextStyle(
                                    fontWeight: FontWeight.bold)),
                            const TextSpan(text: "'s book")
                          ], style: const TextStyle(fontSize: 15.0))),
                          ElevatedButton(
                              onPressed: () {
                                Navigator.pushNamed(context, "/book",
                                    arguments: BookArgs(book));
                              },
                              child: const Text("View"))
                        ]),
                      ),
                    ))
                .toList(),
          ),
        ));
  }
}
