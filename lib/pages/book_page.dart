import 'package:flutter/material.dart';
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
      quotes.sort(
        (a, b) => b.date.compareTo(a.date),
      );

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

  Future<void> Function() _showConfirmDeleteDialogue(Quote quote) {
    return () async {
      await showDialog<bool>(
          context: context,
          builder: (context) {
            return AlertDialog(
              title: const Text('Confirm delete'),
              content: Text(
                  'Are you sure you wanna delete the quote\n"${quote.quote}"\nby ${quote.person}'),
              actions: <Widget>[
                TextButton(
                  style: TextButton.styleFrom(
                    textStyle: Theme.of(context).textTheme.labelLarge,
                  ),
                  child: const Text('NOPE!'),
                  onPressed: () {
                    Navigator.of(context).pop(true);
                  },
                ),
                TextButton(
                  style: TextButton.styleFrom(
                    textStyle: Theme.of(context).textTheme.labelLarge,
                  ),
                  child: const Text('Go ahead!'),
                  onPressed: () {
                    Navigator.of(context).pop(false);
                  },
                ),
              ],
            );
          }).then((res) async {
        if (res ?? false) {
          await quote.delete(context);
          await _getQuotes();
        }
      });
    };
  }

  @override
  Widget build(BuildContext context) => Scaffold(
      appBar: AppBar(
        title: Text(widget.book.name),
        actions: () {
          List<Widget> children = [
            IconButton(
              icon: const Icon(Icons.search),
              onPressed: () {},
            )
          ];

          if (_isOwner) {
            children.add(IconButton(
                onPressed: () {
                  Navigator.of(context)
                      .pushNamed("/settings", arguments: BookArgs(widget.book));
                },
                icon: const Icon(Icons.settings)));
          }

          return children;
        }(),
      ),
      floatingActionButton: FloatingActionButton(
        child: const Icon(Icons.create),
        onPressed: () async {
          var result = ((await Navigator.of(context)
                  .pushNamed("/new-quote", arguments: BookArgs(widget.book))) ??
              false) as bool;
          if (result) {
            await _getQuotes();
          }
        },
      ),
      body: _loading
          ? SizedBox(
              width: MediaQuery.of(context).size.width,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [CircularProgressIndicator(), Text("Loading")],
              ))
          : Padding(
              padding: const EdgeInsets.fromLTRB(15, 0, 15, 0),
              child: ListView.builder(
                itemBuilder: _quoteWidget,
                itemCount: quotes.length,
              )));

  Widget _quoteWidget(BuildContext context, int i) {
    final quote = quotes[i];
    return SizedBox(
        width: MediaQuery.of(context).size.width,
        child: Card(
            child: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Column(children: [
            Text(quote.quote,
                textAlign: TextAlign.center,
                style: const TextStyle(
                    fontWeight: FontWeight.bold, fontSize: 15.0)),
            const SizedBox(
              height: 10,
            ),
            RichText(
                text: TextSpan(children: [
              TextSpan(
                  text: quote.person,
                  style: const TextStyle(fontWeight: FontWeight.bold)),
              TextSpan(
                  text:
                      " - ${quote.date.day}/${quote.date.month}/${quote.date.year}")
            ], style: const TextStyle(fontSize: 12.0))),
            _isOwner
                ? ElevatedButton(
                    onPressed: _showConfirmDeleteDialogue(quote),
                    child: const Text("Remove"))
                : Container()
          ]),
        )));
  }
}
