import 'dart:developer';

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
  bool _loading = false;

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
    setState(() {
      _loading = true;
    });
    try {
      var books =
          (await supabase.from("books").select<List<Map<String, dynamic>>>())
              .map(Book.fromSupabase)
              .toList();
      // Loaded the cached data and any offline data that might need to be uploaded

      setState(() {
        this.books = books;
      });
    } catch (ex) {
      print(ex);
      if (mounted) {
        context.showSnackBar(message: "Cloud not fetch books");
      }
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  @override
  void initState() {
    super.initState();
    _getBooks();
  }

  Widget _booksView() {
    // If the books are still loading, return a loading spinner
    if (_loading) {
      return Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.center,
          children: const [
            CircularProgressIndicator(),
            Text(
              "Loading",
              style: TextStyle(fontWeight: FontWeight.bold),
            )
          ]);
    }

    // Create the list of all children in the column, add a header for `My books`
    List<Widget> columnChildren = [
      const Text(
        "My books",
        style: TextStyle(fontSize: 25.0, fontWeight: FontWeight.w900),
      )
    ];

    // Add cards for all the books owned by the current user
    columnChildren.addAll(
        books.where((book) => book.owner == user?.id).map((book) => Card(
            margin: const EdgeInsets.all(15.0),
            child: Padding(
                padding: const EdgeInsets.all(10.0),
                child: Column(children: [
                  Padding(
                      padding: const EdgeInsets.all(10),
                      child: Text(
                        book.name,
                        style: const TextStyle(
                            fontWeight: FontWeight.bold, fontSize: 20.0),
                      )),
                  ElevatedButton(
                      onPressed: () {
                        Navigator.pushNamed(context, "/book",
                            arguments: BookArgs(book));
                      },
                      child: const Text("View"))
                ])))));

    // Add button to create book and other books heading
    columnChildren.addAll([
      ElevatedButton(onPressed: () {}, child: const Text("Create Book")),
      const SizedBox(
        width: 0,
        height: 50,
      ),
      const Text(
        "Other books",
        style: TextStyle(fontSize: 25.0, fontWeight: FontWeight.w900),
      )
    ]);

    // Add all books owned by other users
    columnChildren.addAll(
        books.where((book) => book.owner != user?.id).map((book) => Card(
            margin: const EdgeInsets.all(15.0),
            child: Padding(
                padding: EdgeInsets.all(10.0),
                child: Column(children: [
                  Padding(
                      padding: const EdgeInsets.all(10),
                      child: Text(
                        book.name,
                        style: const TextStyle(
                            fontWeight: FontWeight.bold, fontSize: 20.0),
                      )),
                  Padding(
                      padding: const EdgeInsets.fromLTRB(10, 0, 10, 10),
                      child: Text(
                        book.ownerEmail,
                        style: const TextStyle(fontSize: 15),
                      )),
                  ElevatedButton(
                      onPressed: () {
                        Navigator.pushNamed(context, "/book",
                            arguments: BookArgs(book));
                      },
                      child: const Text("View"))
                ])))));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: columnChildren,
    );
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
          child: _booksView(),
        ));
  }
}
