import 'package:path/path.dart' as p;
import 'package:sqflite/sqflite.dart';

const _fileName = 'waitlist.db';
const _version = 1;

Future<Database> openAppDatabase() async {
  final directory = await getDatabasesPath();
  return openDatabase(
    p.join(directory, _fileName),
    version: _version,
    onCreate: _onCreate,
    onUpgrade: _onUpgrade,
  );
}

Future<void> _onCreate(Database db, int version) async {
  // AUTOINCREMENT, not a plain rowid: SQLite records the highest ticket ever
  // issued in sqlite_sequence, so a ticket is never reused, even after the
  // newest row is deleted (R2).
  await db.execute('''
    CREATE TABLE parties (
      ticket     INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL CHECK (length(trim(name)) > 0),
      size       INTEGER NOT NULL CHECK (size > 0),
      status     TEXT    NOT NULL DEFAULT 'waiting'
                         CHECK (status IN ('waiting', 'removed')),
      joined_at  INTEGER NOT NULL, -- epoch ms, display only, never used for order
      removed_at INTEGER
    )
  ''');
  await db.execute(
    'CREATE INDEX idx_parties_status_ticket ON parties(status, ticket)',
  );
}

Future<void> _onUpgrade(Database db, int oldVersion, int newVersion) async {
  // Only schema version 1 exists; migrations for later versions belong here.
}
