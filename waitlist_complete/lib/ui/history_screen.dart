import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/party.dart';
import '../state/waitlist_controller.dart';

/// Removed parties, newest removal first. Read-only and loaded once when the
/// screen opens: nothing can write to the database while it is on top.
class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  // Created once here, not in build, so a rebuild doesn't re-query.
  late Future<List<Party>> _history;

  @override
  void initState() {
    super.initState();
    _history = context.read<WaitlistController>().loadHistory();
  }

  void _retry() {
    setState(() {
      _history = context.read<WaitlistController>().loadHistory();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('History')),
      body: FutureBuilder<List<Party>>(
        future: _history,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text("Couldn't load the history."),
                  const SizedBox(height: 12),
                  FilledButton(onPressed: _retry, child: const Text('Retry')),
                ],
              ),
            );
          }
          final parties = snapshot.requireData;
          if (parties.isEmpty) {
            return const Center(child: Text('No removed parties yet'));
          }
          return ListView.builder(
            itemCount: parties.length,
            itemBuilder: (context, index) {
              final party = parties[index];
              final removedAt = party.removedAt;
              return ListTile(
                key: ValueKey(party.ticket),
                leading: Text(
                  '#${party.ticket}',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                title: Text(
                  party.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                subtitle: Text(
                  removedAt == null
                      ? 'Party of ${party.size}'
                      : 'Party of ${party.size} · removed '
                          '${_formatTime(context, removedAt)}',
                ),
              );
            },
          );
        },
      ),
    );
  }
}

String _formatTime(BuildContext context, DateTime time) {
  final localizations = MaterialLocalizations.of(context);
  return '${localizations.formatShortDate(time)}, '
      '${localizations.formatTimeOfDay(TimeOfDay.fromDateTime(time))}';
}
