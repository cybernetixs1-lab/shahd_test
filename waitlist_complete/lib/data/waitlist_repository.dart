import 'package:sqflite/sqflite.dart';

import '../domain/waitlist_rules.dart';
import '../models/party.dart';

class WaitlistRepository {
  const WaitlistRepository(this._db);

  final Database _db;

  static const _table = 'parties';

  /// Returns the ticket SQLite assigned. Re-validates R1 because the form
  /// check is only UX; this is the protection. The insert has no ticket
  /// column, so numbering is entirely the database's job (R2).
  Future<int> add({required String name, required int size}) async {
    final row = {
      'name': validateName(name),
      'size': validatePartySize(size),
      'status': PartyStatus.waiting.dbValue,
      'joined_at': DateTime.now().millisecondsSinceEpoch,
    };
    return _db.insert(_table, row);
  }

  /// Waiting parties in join order. Ordered by ticket, not joined_at, so a
  /// device clock change can never reorder the queue (R3).
  Future<List<Party>> getWaiting() async {
    final rows = await _db.query(
      _table,
      where: 'status = ?',
      whereArgs: [PartyStatus.waiting.dbValue],
      orderBy: 'ticket ASC',
    );
    return rows.map(Party.fromMap).toList();
  }

  /// Removed parties, newest removal first.
  Future<List<Party>> getHistory() async {
    final rows = await _db.query(
      _table,
      where: 'status = ?',
      whereArgs: [PartyStatus.removed.dbValue],
      orderBy: 'removed_at DESC, ticket DESC',
    );
    return rows.map(Party.fromMap).toList();
  }

  /// Writes name and size only, so ticket and position cannot change.
  /// Re-validates R1 exactly like [add]. Only waiting parties are editable.
  Future<void> update(Party party) async {
    await _db.update(
      _table,
      {
        'name': validateName(party.name),
        'size': validatePartySize(party.size),
      },
      where: 'ticket = ? AND status = ?',
      whereArgs: [party.ticket, PartyStatus.waiting.dbValue],
    );
  }

  /// Soft delete: the row stays, so its ticket can never be issued again.
  /// Only touches waiting rows, so removing an already-removed party is a no-op.
  Future<void> remove(int ticket) async {
    await _db.update(
      _table,
      {
        'status': PartyStatus.removed.dbValue,
        'removed_at': DateTime.now().millisecondsSinceEpoch,
      },
      where: 'ticket = ? AND status = ?',
      whereArgs: [ticket, PartyStatus.waiting.dbValue],
    );
  }

  /// Undo of [remove]. The row keeps its ticket and the queue is ordered by
  /// ticket, so the party returns to its original position (R2, R3).
  Future<void> restore(int ticket) async {
    await _db.update(
      _table,
      {'status': PartyStatus.waiting.dbValue, 'removed_at': null},
      where: 'ticket = ? AND status = ?',
      whereArgs: [ticket, PartyStatus.removed.dbValue],
    );
  }
}
