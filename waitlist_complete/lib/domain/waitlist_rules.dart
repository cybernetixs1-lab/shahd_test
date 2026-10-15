// Pure business rules. No Flutter imports: the form shows these messages
// inline, and the repository calls the same functions to re-validate.

/// Assumption, not measured: average minutes until the party ahead is seated.
const avgMinutesPerParty = 10;

/// Thrown when input breaks R1. [message] is safe to show to the user.
class ValidationException implements Exception {
  const ValidationException(this.message);

  final String message;

  @override
  String toString() => message;
}

/// R1: returns the trimmed name, or throws if nothing is left after trimming.
String validateName(String name) {
  final trimmed = name.trim();
  if (trimmed.isEmpty) {
    throw const ValidationException('Enter a name.');
  }
  return trimmed;
}

/// R1: returns [size] if it is greater than 0. No upper bound is specified.
int validatePartySize(int size) {
  if (size <= 0) {
    throw const ValidationException('Party size must be at least 1.');
  }
  return size;
}

/// R1: parses the size field's text, then applies [validatePartySize].
/// Accepts Eastern Arabic digits, and "05" parses as 5.
int parsePartySize(String input) {
  final digits = _normaliseDigits(input.trim());
  if (digits.isEmpty) {
    throw const ValidationException('Enter the party size.');
  }
  // radix: 10 so "0x10" is not read as hex. tryParse also returns null for
  // digit strings beyond the 64-bit int range.
  final size = int.tryParse(digits, radix: 10);
  if (size == null) {
    throw ValidationException(
      _onlyDigits.hasMatch(digits)
          ? 'That number is too large.'
          : 'Enter a whole number.',
    );
  }
  return validatePartySize(size);
}

/// R3 display text: 0 -> "Next", 1 -> "1 party ahead", n -> "n parties ahead".
String partiesAheadLabel(int partiesAhead) => switch (partiesAhead) {
      0 => 'Next',
      1 => '1 party ahead',
      _ => '$partiesAhead parties ahead',
    };

/// Parties ahead × [avgMinutesPerParty], e.g. "≈ 20 min". Null for the next
/// party, since nobody is ahead of it.
String? estimatedWaitLabel(int partiesAhead) => partiesAhead == 0
    ? null
    : '≈ ${partiesAhead * avgMinutesPerParty} min';

/// Runs [rule] and returns its message if it rejects the input, else null.
/// Lets a form field show exactly what the repository would throw.
String? errorMessageOf(void Function() rule) {
  try {
    rule();
    return null;
  } on ValidationException catch (e) {
    return e.message;
  }
}

final _onlyDigits = RegExp(r'^[0-9]+$');

const _easternArabicDigits = '٠١٢٣٤٥٦٧٨٩';

String _normaliseDigits(String input) {
  var result = input;
  for (var i = 0; i < _easternArabicDigits.length; i++) {
    result = result.replaceAll(_easternArabicDigits[i], '$i');
  }
  return result;
}
