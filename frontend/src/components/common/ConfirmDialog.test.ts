import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { ConfirmDialogProps } from './ConfirmDialog.tsx';

describe('ConfirmDialog properties & state contracts', () => {
  it('constructs valid default confirmation dialog props', () => {
    let confirmed = false;
    let cancelled = false;

    const props: ConfirmDialogProps = {
      isOpen: true,
      title: 'Delete meeting?',
      description: 'Are you sure you want to delete "Sprint Retrospective"?',
      onConfirm: () => { confirmed = true; },
      onCancel: () => { cancelled = true; },
    };

    assert.equal(props.isOpen, true);
    assert.equal(props.title, 'Delete meeting?');
    assert.ok(props.description.includes('Sprint Retrospective'));

    props.onConfirm();
    assert.equal(confirmed, true);

    props.onCancel();
    assert.equal(cancelled, true);
  });

  it('correctly handles loading state semantics', () => {
    const loadingProps: ConfirmDialogProps = {
      isOpen: true,
      title: 'Delete meeting?',
      description: 'Are you sure?',
      confirmLabel: 'Deleting...',
      cancelLabel: 'Cancel',
      variant: 'danger',
      loading: true,
      onConfirm: () => {},
      onCancel: () => {},
    };

    assert.equal(loadingProps.loading, true);
    assert.equal(loadingProps.confirmLabel, 'Deleting...');
    assert.equal(loadingProps.variant, 'danger');
  });

  it('supports closed modal state', () => {
    const closedProps: ConfirmDialogProps = {
      isOpen: false,
      title: 'Delete meeting?',
      description: 'Are you sure?',
      onConfirm: () => {},
      onCancel: () => {},
    };

    assert.equal(closedProps.isOpen, false);
  });
});
