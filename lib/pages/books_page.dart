import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:quota/books_model.dart';
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
  late TextEditingController _bookNameController;

  Future<void> _signOut() async {
    context.read<BooksModel>().clear();
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

  @override
  void initState() {
    super.initState();
    _bookNameController = TextEditingController();
    context.read<BooksModel>().refresh(context);
  }

  @override
  void dispose() {
    _bookNameController.dispose();
    super.dispose();
  }

  Widget _booksView(
      BuildContext context, BooksModel booksModel, Widget? child) {
    final loading = booksModel.loading;
    final books = booksModel.books;

    // If the books are still loading, return a loading spinner
    if (loading) {
      return SizedBox(
          width: MediaQuery.of(context).size.width,
          child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              mainAxisAlignment: MainAxisAlignment.center,
              children: const [
                CircularProgressIndicator(),
                Text(
                  "Loading",
                  style: TextStyle(fontWeight: FontWeight.bold),
                )
              ]));
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
      ElevatedButton(
          onPressed: () {
            showDialog<bool>(
                context: context,
                builder: (context) => AlertDialog(
                      title: const Text("Add details"),
                      content: Column(children: [
                        TextField(
                          decoration:
                              const InputDecoration(label: Text("Book name")),
                          controller: _bookNameController,
                        )
                      ]),
                      actions: [
                        TextButton(
                            onPressed: () {
                              if (_bookNameController.text.trim().isEmpty) {
                                context.showErrorSnackBar(
                                    message: "Book name should not be empty");
                                return;
                              }
                              Navigator.pop(context, true);
                            },
                            child: const Text("Ok")),
                        TextButton(
                            onPressed: () => Navigator.pop(context, false),
                            child: const Text("Cancel"))
                      ],
                    )).then((result) {
              if (result ?? false) {
                if (_bookNameController.text.trim() == "") {
                  context.showErrorSnackBar(message: "Book name not be empty");
                  return;
                }

                _bookNameController.clear();
                booksModel.refresh(context);
                final newBook = NewBook(name: _bookNameController.text);

                newBook.create().then((book) {
                  Navigator.pushNamed(context, "/book",
                      arguments: BookArgs(book));
                }).catchError((ex) {
                  log("Cound not create book", error: ex);
                  context.showErrorSnackBar(message: "Could not create book");
                });
              }
            });
          },
          child: const Text("Create Book")),
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
                padding: const EdgeInsets.all(10.0),
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
          ),
        ]),
        floatingActionButton: FloatingActionButton(
            onPressed: () => context.read<BooksModel>().refresh(context),
            child: const Icon(Icons.refresh)),
        body: Container(
          width: MediaQuery.of(context).size.width,
          child: Consumer<BooksModel>(
            builder: _booksView,
          ),
        ));
  }
}
