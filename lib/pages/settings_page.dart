import 'package:flutter/material.dart';
import 'package:flutter/src/widgets/container.dart';
import 'package:flutter/src/widgets/framework.dart';
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

  Future getMembers() async {
    try {
      final members = await widget.book.getMembers();
      print(members);
    } catch (ex) {
      print(ex);
      context.showErrorSnackBar(message: "Could not fetch users");
    }
  }

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("${widget.book.ownerEmail} Settings")),
      body: Column(
        children: [
          SizedBox(
            height: MediaQuery.of(context).size.height * 0.75,
            child: Card(
              child: SingleChildScrollView(
                  child: Column(
                children: [
                  ElevatedButton(
                      onPressed: getMembers, child: const Text("Okey"))
                ],
              )),
            ),
          )
        ],
      ),
    );
  }
}
