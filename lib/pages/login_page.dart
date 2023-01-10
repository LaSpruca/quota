import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'package:quota/contants.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  _LoginPageState createState() => _LoginPageState();
}

// I did not create this regex my self, thanks https://www.abstractapi.com/tools/email-regex-guide
final emailRegex = RegExp(
    r'^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$');

class _LoginPageState extends State<LoginPage> {
  bool _isLoading = false;
  bool _redirecting = false;
  late final TextEditingController _emailController;
  late final StreamSubscription<AuthState> _authStateSubscription;
  late final TextEditingController _passwordController;
  bool _validEmail = false;
  bool _validPassword = false;

  Future<void> _signInPassword() async {
    setState(() {
      _isLoading = true;
    });

    try {
      await supabase.auth.signInWithPassword(
          password: _passwordController.text, email: _emailController.text);
    } on AuthException catch (error) {
      context.showErrorSnackBar(message: error.message);
    } catch (ex) {
      context.showErrorSnackBar(message: "Unexpected error occurred");
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _signInEmail() async {
    setState(() {
      _isLoading = true;
    });
    try {
      await supabase.auth.signInWithOtp(
        email: _emailController.text,
        emailRedirectTo: kIsWeb ? null : 'nz.laspruca.quotes://login-callback/',
      );
      if (mounted) {
        context.showSnackBar(message: 'Check your email for login link!');
        _emailController.clear();
      }
    } on AuthException catch (error) {
      context.showErrorSnackBar(message: error.message);
    } catch (error) {
      context.showErrorSnackBar(message: 'Unexpected error occurred');
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _signUp() async {
    setState(() {
      _isLoading = true;
    });

    try {
      await supabase.auth.signUp(
          password: _passwordController.text,
          email: _emailController.text,
          emailRedirectTo:
              kIsWeb ? null : "nz.laspruca.quotes://login-callback");
    } on AuthException catch (error) {
      context.showErrorSnackBar(message: error.message);
    } catch (error) {
      context.showErrorSnackBar(message: 'Unexpected error occurred');
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  void initState() {
    _emailController = TextEditingController();
    _passwordController = TextEditingController();
    _authStateSubscription = supabase.auth.onAuthStateChange.listen((data) {
      if (_redirecting) return;
      final session = data.session;
      if (session != null) {
        _redirecting = true;
        Navigator.of(context).pushReplacementNamed('/books');
      }
    });
    super.initState();
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _authStateSubscription.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => DefaultTabController(
      length: 2,
      child: Scaffold(
        // ignore: prefer_const_literals_to_create_immutables
        appBar: AppBar(
            title: const Text("Login"),
            bottom: const TabBar(tabs: [
              Tab(
                text: "Sign In",
              ),
              Tab(text: "Sign up")
            ])),
        body: TabBarView(children: [
          Padding(
              padding: const EdgeInsets.all(15),
              child: Form(
                  child: Column(
                children: [
                  TextFormField(
                    controller: _emailController,
                    autofillHints: const [AutofillHints.email],
                    decoration: const InputDecoration(label: Text("Email")),
                    validator: (value) =>
                        value != null && emailRegex.hasMatch(value)
                            ? null
                            : "Please enter a valid email",
                    onChanged: (value) => {
                      setState(() {
                        _validEmail = emailRegex.hasMatch(value.trim());
                      })
                    },
                  ),
                  TextField(
                      controller: _passwordController,
                      autofillHints: const [AutofillHints.password],
                      obscureText: true,
                      onChanged: (value) {
                        setState(() {
                          _validPassword = value.trim() != "";
                        });
                      },
                      decoration:
                          const InputDecoration(label: Text("Password"))),
                  ElevatedButton(
                    onPressed:
                        (_validEmail && !_isLoading) ? _signInEmail : null,
                    child: const Text("Send magic link"),
                  ),
                  ElevatedButton(
                    onPressed: (_validEmail && _validPassword && !_isLoading)
                        ? _signInPassword
                        : null,
                    child: const Text("Sign in"),
                  )
                ],
              ))),
          Padding(
              padding: const EdgeInsets.all(15),
              child: Form(
                  child: Column(
                children: [
                  TextFormField(
                    controller: _emailController,
                    autofillHints: const [AutofillHints.email],
                    decoration: const InputDecoration(label: Text("Email")),
                    validator: (value) =>
                        value != null && emailRegex.hasMatch(value)
                            ? null
                            : "Please enter a valid email",
                    onChanged: (value) => {
                      setState(() {
                        _validEmail = emailRegex.hasMatch(value.trim());
                      })
                    },
                  ),
                  TextField(
                      controller: _passwordController,
                      autofillHints: const [AutofillHints.password],
                      obscureText: true,
                      onChanged: (value) {
                        setState(() {
                          _validPassword = value.trim() != "";
                        });
                      },
                      decoration:
                          const InputDecoration(label: Text("Password"))),
                  ElevatedButton(
                    onPressed: (_validEmail && _validPassword && !_isLoading)
                        ? _signUp
                        : null,
                    child: const Text("Sign up"),
                  )
                ],
              ))),
        ]),
      ));
}
