import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/src/widgets/container.dart';
import 'package:flutter/src/widgets/framework.dart';
import 'package:quota/contants.dart';
import 'package:quota/pages/book_args_widget.dart';
import 'package:quota/supabase.dart';

class BookPage extends StatefulWidget {
  final Book book;
  const BookPage({super.key, required this.book});

  @override
  State<BookPage> createState() => _BookPageState();
}

class _BookPageState extends State<BookPage> {
  List<Quote> quotes = [];
  bool _loading = false;
  bool _isOwner = false;
  // late Book book;

  Future<void> _getQuotes() async {
    try {
      setState(() {
        _isOwner = (supabase.auth.currentSession != null)
            ? supabase.auth.currentSession!.user.id == widget.book.owner
            : false;
        _loading = true;
      });

      var quotes = await widget.book.quotes();

      setState(() {
        this.quotes = quotes;
      });
    } catch (ex) {
      print(ex);
      if (mounted) {
        context.showErrorSnackBar(message: "Could not fetch quotes");
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
    _getQuotes();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: Text("${widget.book.ownerEmail}'s Book"),
          actions: () {
            List<Widget> children = [
              IconButton(
                icon: const Icon(Icons.search),
                onPressed: () {
                  dump();
                },
              )
            ];

            if (_isOwner) {
              children.add(IconButton(
                  onPressed: () {}, icon: const Icon(Icons.settings)));
            }

            return children;
          }(),
        ),
        floatingActionButton: FloatingActionButton(
          child: Icon(Icons.create),
          onPressed: () async {
            var result = ((await Navigator.of(context).pushNamed("/new-quote",
                    arguments: BookArgs(widget.book))) ??
                false) as bool;
            if (result) {
              await _getQuotes();
            }
          },
        ),
        body: _loading
            ? Center(
                child: Column(children: const [
                  CircularProgressIndicator(),
                  Text("Loading")
                ]),
              )
            : SingleChildScrollView(
                child: Padding(
                    padding: const EdgeInsets.fromLTRB(15, 10, 15, 20),
                    child: Column(
                      children: quotes
                          .map((quote) => SizedBox(
                              width: MediaQuery.of(context).size.width,
                              child: Card(
                                  child: Padding(
                                padding: const EdgeInsets.all(8.0),
                                child: Column(children: [
                                  Text(quote.quote,
                                      textAlign: TextAlign.center,
                                      style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 15.0)),
                                  const SizedBox(
                                    height: 10,
                                  ),
                                  RichText(
                                      text: TextSpan(children: [
                                    TextSpan(
                                        text: quote.person,
                                        style: const TextStyle(
                                            fontWeight: FontWeight.bold)),
                                    TextSpan(
                                        text:
                                            " - ${quote.date.day}/${quote.date.month}/${quote.date.year}")
                                  ], style: const TextStyle(fontSize: 12.0)))
                                ]),
                              ))))
                          .toList(),
                    ))));
  }
}
