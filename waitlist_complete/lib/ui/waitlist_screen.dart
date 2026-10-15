import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../domain/waitlist_rules.dart';
import '../models/party.dart';
import '../state/waitlist_controller.dart';
import 'history_screen.dart';
import 'party_form_sheet.dart';

class WaitlistScreen extends StatelessWidget {
  const WaitlistScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<WaitlistController>();
    final isReady = controller.status == LoadStatus.ready;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Waitlist'),
        actions: [
          IconButton(
            tooltip: 'History',
            icon: const Icon(Icons.history),
            onPressed: () {
              // History loads once; an Undo tapped on top of it would make it stale.
              ScaffoldMessenger.of(context).hideCurrentSnackBar();
              Navigator.push(
                context,
                MaterialPageRoute<void>(builder: (_) => const HistoryScreen()),
              );
            },
          ),
        ],
      ),
      body: switch (controller.status) {
        // Shown until the first read completes, so the empty state never flashes.
        LoadStatus.loading => const Center(child: CircularProgressIndicator()),
        LoadStatus.error => _ErrorView(onRetry: controller.retry),
        LoadStatus.ready => _WaitingList(
            entries: controller.entries,
            isBusy: controller.isBusy,
          ),
      },
      floatingActionButton: isReady
          ? FloatingActionButton.extended(
              onPressed: () => showAddPartySheet(context),
              icon: const Icon(Icons.person_add),
              label: const Text('Add party'),
            )
          : null,
    );
  }
}

class _WaitingList extends StatelessWidget {
  const _WaitingList({required this.entries, required this.isBusy});

  final List<QueueEntry> entries;
  final bool isBusy;

  @override
  Widget build(BuildContext context) {
    if (entries.isEmpty) {
      return const Center(child: Text('No parties waiting'));
    }
    return ListView.builder(
      padding: const EdgeInsets.only(bottom: 88), // last row stays above the FAB
      itemCount: entries.length,
      itemBuilder: (context, index) {
        final entry = entries[index];
        final party = entry.party;
        final wait = estimatedWaitLabel(entry.partiesAhead);
        return ListTile(
          key: ValueKey(party.ticket),
          leading: Text(
            '#${party.ticket}',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          title: Text(party.name, maxLines: 1, overflow: TextOverflow.ellipsis),
          subtitle: Text(
            [
              'Party of ${party.size}',
              partiesAheadLabel(entry.partiesAhead),
              if (wait != null) wait,
            ].join(' · '),
          ),
          trailing: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              IconButton(
                tooltip: 'Edit',
                icon: const Icon(Icons.edit_outlined),
                onPressed:
                    isBusy ? null : () => showEditPartySheet(context, party),
              ),
              IconButton(
                tooltip: 'Remove',
                icon: const Icon(Icons.close),
                onPressed: isBusy ? null : () => _remove(context, party),
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _remove(BuildContext context, Party party) async {
    final controller = context.read<WaitlistController>();
    final messenger = ScaffoldMessenger.of(context);
    try {
      if (!await controller.removeParty(party.ticket)) return;
    } on Exception {
      messenger.showSnackBar(
        SnackBar(
          content: Text("Couldn't remove #${party.ticket}. Please try again."),
        ),
      );
      return;
    }
    // Undo always restores the latest removal, so hide any older Undo first:
    // only the latest removal's SnackBar may stay on screen.
    messenger
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Text('Removed #${party.ticket} ${party.name}'),
          action: SnackBarAction(
            label: 'Undo',
            onPressed: () => _undo(controller, messenger),
          ),
        ),
      );
  }

  Future<void> _undo(
    WaitlistController controller,
    ScaffoldMessengerState messenger,
  ) async {
    try {
      await controller.undoLastRemoval();
    } on Exception {
      messenger.showSnackBar(
        const SnackBar(content: Text("Couldn't undo. Please try again.")),
      );
    }
  }
}

class _ErrorView extends StatelessWidget {
  const _ErrorView({required this.onRetry});

  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text("Couldn't load the waitlist."),
          const SizedBox(height: 12),
          FilledButton(onPressed: onRetry, child: const Text('Retry')),
        ],
      ),
    );
  }
}
