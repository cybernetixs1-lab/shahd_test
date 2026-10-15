enum PartyStatus {
  waiting('waiting'),
  removed('removed');

  const PartyStatus(this.dbValue);

  /// Stored TEXT value. Kept separate from the Dart name so renaming an enum
  /// value can't silently break rows already on disk.
  final String dbValue;

  static PartyStatus fromDb(String value) =>
      values.firstWhere((status) => status.dbValue == value);
}

class Party {
  const Party({
    required this.ticket,
    required this.name,
    required this.size,
    required this.status,
    required this.joinedAt,
    this.removedAt,
  });

  factory Party.fromMap(Map<String, Object?> map) {
    final removedAt = map['removed_at'] as int?;
    return Party(
      ticket: map['ticket'] as int,
      name: map['name'] as String,
      size: map['size'] as int,
      status: PartyStatus.fromDb(map['status'] as String),
      joinedAt: DateTime.fromMillisecondsSinceEpoch(map['joined_at'] as int),
      removedAt: removedAt == null
          ? null
          : DateTime.fromMillisecondsSinceEpoch(removedAt),
    );
  }

  final int ticket;
  final String name;
  final int size;
  final PartyStatus status;
  final DateTime joinedAt;
  final DateTime? removedAt;

  Map<String, Object?> toMap() => {
        'ticket': ticket,
        'name': name,
        'size': size,
        'status': status.dbValue,
        'joined_at': joinedAt.millisecondsSinceEpoch,
        'removed_at': removedAt?.millisecondsSinceEpoch,
      };

  /// Only the user-editable fields. Ticket, status and timestamps are owned
  /// by the database, so there is no way to change them here (R2).
  Party copyWith({String? name, int? size}) => Party(
        ticket: ticket,
        name: name ?? this.name,
        size: size ?? this.size,
        status: status,
        joinedAt: joinedAt,
        removedAt: removedAt,
      );
}
