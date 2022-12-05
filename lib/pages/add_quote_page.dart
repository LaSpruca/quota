import 'package:flutter/material.dart';
import 'package:quota/contants.dart';

import '../supabase.dart';

class AddQuotePage extends StatefulWidget {
  final Book book;
  const AddQuotePage({super.key, required this.book});

  @override
  State<AddQuotePage> createState() => _AddQuotePageState();
}

final RegExp dateTimeRegex = RegExp(r'^(\d{1,2})\/(\d{1,2})\/((\d{2}){1,2})$');

class _AddQuotePageState extends State<AddQuotePage> {
  final GlobalKey<FormState> _formKey = GlobalKey();
  final DateTime date = DateTime.now();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _quoteController = TextEditingController();

  @override
  void dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(title: const Text("Add Quote")),
        body: Padding(
          padding: const EdgeInsets.all(15),
          child: Form(
              key: _formKey,
              onChanged: () {
                _formKey.currentState!.validate();
              },
              child: Column(
                children: [
                  TextFormField(
                    controller: _quoteController,
                    decoration: const InputDecoration(labelText: "Quote"),
                    validator: (value) => (value == null || value.trim() == "")
                        ? "Quote must not be an empty string"
                        : null,
                  ),
                  TextFormField(
                    controller: _nameController,
                    decoration: const InputDecoration(labelText: "Person"),
                    validator: (value) => (value == null || value.trim() == "")
                        ? "Name must not be an empty string"
                        : null,
                  ),
                  FormField(
                      builder: (context) => TextButton(
                          onPressed: () async {
                            var date = await showDatePicker(
                                context: context.context,
                                initialDate: this.date,
                                firstDate: DateTime(2010),
                                lastDate: DateTime.now());
                          },
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text("${date.day}/${date.month}/${date.year}",
                                  style: const TextStyle(color: Colors.white)),
                              const Icon(Icons.calendar_month)
                            ],
                          ))),
                  ElevatedButton.icon(
                      onPressed: () {
                        if (_formKey.currentState!.validate()) {
                          print("adding quote");
                          NewQuote(
                                  book: widget.book.id,
                                  date: date,
                                  person: _nameController.text,
                                  quote: _quoteController.text)
                              .add()
                              .then((_) {
                            print("Success");
                            Navigator.of(context).pop(true);
                          }).catchError((ex) {
                            print(ex);
                            context.showErrorSnackBar(
                                message: "Could not add quote");
                            Navigator.of(context).pop(false);
                          });
                        }
                      },
                      icon: const Icon(Icons.add),
                      label: const Text("Submit"))
                ],
              )),
        ));
  }
}
