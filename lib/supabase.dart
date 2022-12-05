import 'dart:convert';

import 'package:quota/contants.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:json_annotation/json_annotation.dart';

part 'supabase.g.dart';

Map<String, CacheEntry> quotesCache = {};
List<NewQuote> needsAdding = [];
List<NewQuote> needsRemoving = [];

Future<void> dump() async {
  var data = {
    "quoteCache": quotesCache,
    "needsAdding": needsAdding,
    "needsRemoving": needsRemoving
  };
  var json = jsonEncode(toJson(data));
  print(json);
}

@JsonSerializable()
class CacheEntry {
  final DateTime expiry;
  final List<Quote> quotes;

  const CacheEntry({required this.expiry, required this.quotes});

  factory CacheEntry.fromJson(Map<String, dynamic> json) =>
      _$CacheEntryFromJson(json);
  Map<String, dynamic> toJson() => _$CacheEntryToJson(this);
}

@JsonSerializable()
class Book {
  late final String id;
  late final String owner;
  late final String ownerEmail;

  Book({required this.id, required this.owner, required this.ownerEmail});

  Future<List<Quote>> quotes() async {
    var cachedItem = quotesCache[id];
    if (cachedItem != null &&
        cachedItem.expiry.millisecondsSinceEpoch >
            DateTime.now().millisecondsSinceEpoch) {
      return cachedItem.quotes;
    }

    return await fetchQuotes();
  }

  Future<List<Quote>> fetchQuotes() async {
    var quotes = (await supabase
            .from("quotes")
            .select<List<Map<String, dynamic>>>()
            .eq("book", id)
            .order("date", ascending: true))
        .map((map) => Quote(
              person: map["person"],
              quote: map["quote"],
              date: DateTime.parse(map["date"]),
              book: map["book"],
              id: map["id"],
            ))
        .toList();

    quotesCache[id] = CacheEntry(
        expiry: DateTime.now().add(const Duration(hours: 3)), quotes: quotes);

    dump();

    return quotes;
  }

  factory Book.fromJson(Map<String, dynamic> json) => _$BookFromJson(json);

  Map<String, dynamic> toJson() => _$BookToJson(this);
}

@JsonSerializable()
class Quote {
  late final String id;
  late final String person;
  late final String quote;
  late final DateTime date;
  late final String book;

  Quote(
      {required this.id,
      required this.book,
      required this.date,
      required this.person,
      required this.quote});

  /// Connect the generated [_$PersonFromJson] function to the `fromJson`
  /// factory.
  factory Quote.fromJson(Map<String, dynamic> json) => _$QuoteFromJson(json);

  /// Connect the generated [_$PersonToJson] function to the `toJson` method.
  Map<String, dynamic> toJson() => _$QuoteToJson(this);
}

@JsonSerializable()
class NewQuote {
  late final String book;
  late final String person;
  late final String quote;
  late final DateTime date;

  NewQuote(
      {required this.book,
      required this.person,
      required this.quote,
      required this.date});

  Future<void> add() async {
    final dict = {
      "book": book,
      "person": person,
      "quote": quote,
      "date": date.toIso8601String()
    };

    quotesCache.remove(book);

    await supabase.from("quotes").insert(dict);
  }

  factory NewQuote.fromJson(Map<String, dynamic> json) =>
      _$NewQuoteFromJson(json);
  Map<String, dynamic> toJson() => _$NewQuoteToJson(this);
}
