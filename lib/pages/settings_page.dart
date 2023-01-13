import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/src/widgets/container.dart';
import 'package:flutter/src/widgets/framework.dart';
import 'package:provider/provider.dart';
import 'package:quota/books_model.dart';
import 'package:quota/pages/book_args_widget.dart';
import 'package:quota/supabase.dart';
import 'package:quota/contants.dart';

class SettingsPage extends StatefulWidget {
  final Book book;

  const SettingsPage({super.key, required this.book});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  List<Member> _members = [];
  late TextEditingController _memberEmailController;
  late TextEditingController _bookNameController;

  Future _getMembers() async {
    try {
      final members = await widget.book.getMembers();

      setState(() {
        _members = members;
      });
    } catch (ex) {
      log("Could not fetch users", error: ex);
      context.showErrorSnackBar(message: "Could not fetch users");
    }
  }

  @override
  void initState() {
    _memberEmailController = TextEditingController();
    _bookNameController = TextEditingController();
    _bookNameController.text = widget.book.name;
    _getMembers();
    super.initState();
  }

  @override
  void dispose() {
    _memberEmailController.dispose();
    super.dispose();
  }

  AlertDialog _addUserDialog(BuildContext context) => AlertDialog(
        content: TextField(
            controller: _memberEmailController,
            decoration: const InputDecoration(label: Text("User email"))),
        actions: [
          TextButton(
              onPressed: () {
                if (_memberEmailController.text.trim() == "") {
                  context.showErrorSnackBar(
                      message: "Email filed should not be empty");

                  return;
                }

                Navigator.pop(context);

                widget.book.addMember(_memberEmailController.text.trim()).then(
                  (_) {
                    _getMembers();
                  },
                ).catchError((ex) {
                  log("Could not fetch users", error: ex);
                  this.context.showErrorSnackBar(message: "Couldn't add user");
                });

                _memberEmailController.clear();
              },
              child: const Text("Ok")),
          TextButton(
              onPressed: () {
                Navigator.pop(context);
              },
              child: const Text("Dismiss"))
        ],
      );

  AlertDialog _removeUserDialog(Member member, BuildContext context) =>
      AlertDialog(
        content: Text("Are you sure you want to remove ${member.email}"),
        actions: [
          TextButton(
              onPressed: () {
                Navigator.pop(context);
              },
              child: const Text("Cancel")),
          TextButton(
              onPressed: () {
                member.removeFrom(widget.book).then((value) {
                  _getMembers().then((_) {
                    Navigator.pop(context);
                  });
                }).catchError((ex) {
                  Navigator.pop(context);
                  log("Could not remove user", error: ex);
                  this
                      .context
                      .showErrorSnackBar(message: "Could not remove user");
                });
              },
              child: const Text("Confirm"))
        ],
      );

  AlertDialog _deleteBookDialog(BuildContext context) => AlertDialog(
        content: Text("Are you sure you want to delete ${widget.book.name}"),
        actions: [
          TextButton(
              onPressed: () {
                widget.book.remove().then((_) {
                  Navigator.pop(context);
                  context.read<BooksModel>().refresh(this.context);
                  Navigator.pop(this.context);
                  Navigator.pop(this.context);
                }).catchError((ex) {
                  log("Could not delete users", error: ex);
                  context.showErrorSnackBar(message: "Could not delete book");
                });
              },
              child: const Text("Yes")),
          TextButton(
              onPressed: () {
                Navigator.pop(context);
              },
              child: const Text("No")),
        ],
      );

  Widget _buildBookSettings() {
    return Column(
      children: [
        const Text(
          "Book settings",
          style: TextStyle(fontSize: 25.0, fontWeight: FontWeight.bold),
        ),
        Padding(
            padding: const EdgeInsetsDirectional.all(10),
            child: TextField(
              controller: _bookNameController,
              decoration: const InputDecoration(label: Text("Book name")),
            )),
        ElevatedButton(
          onPressed: () {
            widget.book.updateName(_bookNameController.text).then((newBook) {
              context.read<BooksModel>().refresh(context);
              Navigator.pop(context);
              Navigator.pop(context);
              Navigator.pushNamed(context, "/book",
                  arguments: BookArgs(newBook));
            }).catchError((ex) {
              log("Could not update book name", error: ex);
              context.showErrorSnackBar(message: "Could not set book name");
            });
          },
          child: const Text("Apply"),
        )
      ],
    );
  }

  Widget _buildMembersList() {
    final List<Widget> children = [
      const Text(
        "Users",
        style: TextStyle(fontSize: 25.0, fontWeight: FontWeight.bold),
      ),
      const SizedBox(
        height: 20,
      ),
    ];

    children.addAll(_members
        .map((member) => [
              Padding(
                  padding: const EdgeInsets.fromLTRB(10, 0, 10, 0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(member.email),
                      TextButton(
                        onPressed: () {
                          showDialog(
                              context: context,
                              builder: (context) =>
                                  _removeUserDialog(member, context));
                        },
                        child: const Text(
                          "Remove",
                        ),
                      )
                    ],
                  )),
              const SizedBox(
                height: 10,
              )
            ])
        .expand((element) => element));
    children.add(ElevatedButton(
        onPressed: () {
          showDialog(context: context, builder: _addUserDialog);
        },
        child: const Text("Add user")));

    return Column(children: children);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(title: Text("${widget.book.name} Settings")),
        body: SizedBox(
            width: MediaQuery.of(context).size.width,
            child: SingleChildScrollView(
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    SizedBox(
                        width: MediaQuery.of(context).size.width * 0.7,
                        child: Card(
                          child: _buildBookSettings(),
                        )),
                    SizedBox(
                        width: MediaQuery.of(context).size.width * 0.7,
                        child: Card(
                          child: _buildMembersList(),
                        )),
                    ElevatedButton(
                        onPressed: () {
                          showDialog(
                              context: context,
                              builder: (context) => _deleteBookDialog(context));
                        },
                        style: const ButtonStyle(
                            backgroundColor:
                                MaterialStatePropertyAll(Colors.red)),
                        child: const Text("Delete Book"))
                  ]),
            )));
  }
}
