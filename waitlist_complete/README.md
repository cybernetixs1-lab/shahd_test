# Waitlist

A local waitlist app for Android. Staff add a party, the database assigns it a ticket number, and every waiting party shows how many parties are ahead of it.

## 1. How to run

Built and tested with **Flutter X.Y.Z (Dart A.B.C), stable channel**. Check yours with `flutter --version`.

```bash
flutter pub get
flutter emulators --launch <emulator_id>   # or start one from Android Studio's Device Manager
flutter run                                # add --release for a smoother demo
```

Dependencies are `sqflite`, `path` and `provider` only. There is no code generation and no extra build step, and `pubspec.lock` is committed.

## 2. Why Flutter + sqflite

Flutter gives one Dart codebase with a fast Android build, which fits the timebox and lets a reviewer run the app with only `flutter pub get` and `flutter run`. sqflite keeps the queue in an on-device SQLite file, so the data survives a full app kill, and the database itself enforces the rules through `AUTOINCREMENT` ticket numbers and `CHECK` constraints, with no code generation.

## 3. What is complete and what is not

**Complete**

- **Add a party.** The name is trimmed and must not be empty. The size must be a whole number greater than 0, and Eastern Arabic digits (٠-٩) are accepted. Errors appear under each field, and the repository validates the input again before writing.
- **Ticket numbers.** SQLite assigns them, and they are unique, strictly increasing and never reused. This holds after removing the newest party, after removing everyone, and after a restart.
- **Waiting list.** Parties appear in join order. Each row shows the ticket, name, size and "Next", "1 party ahead" or "N parties ahead".
- **Remove a party.** This is a soft delete. Positions update immediately because the list is reloaded from the database after every change.
- **Screen states.** There is a loading state on first launch, an empty state, and an error state with Retry.
- **Double-tap protection.** A rapid double tap on Add creates exactly one party.
- **Persistence.** After a force-stop, the list, its order and the ticket numbering are exactly as before.
- **Undo the last removal.** A SnackBar offers Undo, and the party returns with its original ticket in its original position.
- **Edit a waiting party.** Name and size use the same validation as Add. The ticket and position do not change.
- **History.** A separate screen lists removed parties, newest removal first, and it survives restarts.
- **Estimated wait.** Each row shows "≈ N min", calculated from the number of parties ahead.

**Not complete**

- There are no automated tests, which are out of scope. Every check was done manually on an Android emulator.
- The app only targets Android. It was not run on iOS, web or desktop.
- There is no backend, sync, login or notifications, as specified.

## 4. How I verified an AI suggestion

> _Placeholder: to be written by the author from a real check._
>
> - **Suggestion:**
> - **How I checked it:**
> - **Result and what I changed:**

## 5. Assumptions

- **Join order is ticket order.** The join timestamp is stored for display only, so changing the device clock cannot reorder the queue.
- **"Parties ahead" counts parties, not people.** The first waiting party shows "Next". The value is calculated from the list every time and never stored.
- **Party size has no upper limit.** Any whole number greater than 0 that fits in a 64-bit integer is accepted. Larger numbers are rejected as too large. Leading zeros are allowed, so "05" is saved as 5.
- **Names have no maximum length.** Only leading and trailing whitespace is removed, and long names are cut off with "…" in the list.
- **Removed parties stay in the database** with status `removed`. Their tickets are therefore never issued again, and gaps in the numbering are expected.
- **Clearing app data or uninstalling counts as a fresh install.** The queue is emptied and the numbering restarts at 1.
- **The app runs on one device for one user.** There is no sync between devices.
- **After a successful add,** the form closes and the assigned ticket is shown in a dialog so staff can tell the party.
- **When a load fails,** the app shows an error screen with Retry rather than a list that might not match the database.
- **Undo restores the original position.** A restored party keeps its ticket, so parties who joined after it are behind it again.
- **Undo is single-level and kept in memory.** Only the most recent removal can be undone, and only while its SnackBar is visible. The option is lost after a restart.
- **The estimated wait is an assumption, not a measurement.** It is parties ahead × `avgMinutesPerParty` (10 minutes, in `lib/domain/waitlist_rules.dart`). The next party shows no estimate.
- **History is ordered by removal time** from the device clock. Only the queue itself is protected from clock changes. A party that is restored leaves the history.
