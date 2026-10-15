import 'package:flutter/foundation.dart';

import '../data/waitlist_repository.dart';
import '../models/party.dart';

enum LoadStatus { loading, ready, error }

typedef QueueEntry = ({Party party, int partiesAhead});

/// Never edits the list in memory: after every successful write it re-reads
/// SQLite, so the screen only ever shows persisted data.
class WaitlistController extends ChangeNotifier {
  WaitlistController(this._repository);

  final WaitlistRepository _repository;

  LoadStatus _status = LoadStatus.loading;
  List<Party> _waiting = const [];
  bool _isBusy = false;

  /// Single-level undo, held in memory only, so it is gone after a restart.
  int? _lastRemovedTicket;

  LoadStatus get status => _status;
  bool get isBusy => _isBusy;

  /// R3: parties ahead = index in the waiting list, which the repository
  /// returns ordered by ticket. Recomputed on every read, never stored.
  List<QueueEntry> get entries => List.generate(
        _waiting.length,
        (index) => (party: _waiting[index], partiesAhead: index),
      );

  /// Never throws. If the read fails, the screen shows the error state
  /// rather than a list that may no longer match the database.
  Future<void> load() async {
    try {
      _waiting = await _repository.getWaiting();
      _status = LoadStatus.ready;
    } on Exception {
      _status = LoadStatus.error;
    }
    notifyListeners();
  }

  Future<void> retry() {
    _status = LoadStatus.loading;
    notifyListeners();
    return load();
  }

  Future<List<Party>> loadHistory() => _repository.getHistory();

  /// Returns the DB-assigned ticket, or null if the write was skipped.
  Future<int?> addParty({required String name, required int size}) async {
    int? ticket;
    await _write(() async {
      ticket = await _repository.add(name: name, size: size);
    });
    return ticket;
  }

  /// Returns false if the write was skipped. The ticket cannot change:
  /// copyWith has no ticket parameter and the update only sets name and size.
  Future<bool> editParty(Party edited) =>
      _write(() => _repository.update(edited));

  /// Returns false if the write was skipped.
  Future<bool> removeParty(int ticket) async {
    final removed = await _write(() => _repository.remove(ticket));
    if (removed) _lastRemovedTicket = ticket;
    return removed;
  }

  Future<void> undoLastRemoval() async {
    final ticket = _lastRemovedTicket;
    if (ticket == null) return;
    if (await _write(() => _repository.restore(ticket))) {
      _lastRemovedTicket = null;
    }
  }

  /// Every write: skip if another one is running, persist, then reload.
  /// The flag is set before the first await, so a second tap that arrives
  /// before the button rebuilds as disabled still cannot write twice.
  /// Returns false if skipped. Throws if the write fails; the list is unchanged.
  Future<bool> _write(Future<void> Function() write) async {
    if (_isBusy) return false;
    _setBusy(true);
    try {
      await write();
      await load();
      return true;
    } finally {
      _setBusy(false);
    }
  }

  void _setBusy(bool value) {
    _isBusy = value;
    notifyListeners();
  }
}
