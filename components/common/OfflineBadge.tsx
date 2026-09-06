'use client';

import * as React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import {
  setOnlineStatus,
  setSyncStatus,
  setPendingMutationCount,
  setLastSyncedAt,
  setSyncError,
} from '@/lib/redux/slices/offlineSlice';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  syncPendingMutations,
  getPendingMutations,
  loadOfflineSnapshot,
} from '@/lib/offline/db';

export function OfflineBadge() {
  const dispatch = useAppDispatch();
  const { isOnline, syncStatus, pendingMutationCount } = useAppSelector(
    (state) => state.offline
  );

  const refreshPendingCount = React.useCallback(async () => {
    try {
      const pending = await getPendingMutations();
      dispatch(setPendingMutationCount(pending.length));
    } catch {
      // IndexedDB might not be available in SSR
    }
  }, [dispatch]);

  const handleSync = React.useCallback(async () => {
    if (!navigator.onLine) {
      toast.error('Cannot sync while offline', {
        description: 'Please check your internet connection and try again.',
      });
      return;
    }

    dispatch(setSyncStatus('syncing'));
    try {
      const result = await syncPendingMutations();
      if (result.errors.length > 0) {
        dispatch(setSyncError('Some mutations failed to sync'));
        toast.warning('Sync completed with warnings', {
          description: `${result.syncedCount} synced, ${result.errors.length} failed`,
        });
      } else {
        dispatch(setLastSyncedAt(new Date().toISOString()));
        toast.success('Sync complete', {
          description: `All ${result.syncedCount} offline changes synchronized with server.`,
        });
      }
      await refreshPendingCount();
    } catch (err: any) {
      dispatch(setSyncError(err?.message || 'Sync failed'));
      toast.error('Sync failed', {
        description: 'Unable to reach backend services.',
      });
    }
  }, [dispatch, refreshPendingCount]);

  React.useEffect(() => {
    const handleOnline = () => {
      dispatch(setOnlineStatus(true));
      toast.info('Connection restored', {
        description: 'You are back online. Synchronizing data...',
      });
      handleSync();
    };

    const handleOffline = () => {
      dispatch(setOnlineStatus(false));
      toast.warning('Working Offline', {
        description: 'Changes will be saved locally in IndexedDB and synced later.',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    dispatch(setOnlineStatus(navigator.onLine));
    refreshPendingCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch, handleSync, refreshPendingCount]);

  if (isOnline && pendingMutationCount === 0 && syncStatus === 'idle') {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-2 py-1">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="hidden sm:inline">Online</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {!isOnline ? (
        <Badge variant="destructive" className="flex items-center gap-1.5 py-1">
          <WifiOff className="h-3 w-3" />
          <span>Offline Mode</span>
        </Badge>
      ) : (
        <Badge variant="warning" className="flex items-center gap-1.5 py-1">
          <Wifi className="h-3 w-3" />
          <span>{pendingMutationCount} pending sync</span>
        </Badge>
      )}

      <Button
        variant="outline"
        size="sm"
        className="h-7 text-xs flex items-center gap-1 px-2"
        disabled={syncStatus === 'syncing'}
        onClick={handleSync}
        title="Sync changes with server"
      >
        <RefreshCw
          className={`h-3 w-3 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`}
        />
        <span className="hidden md:inline">Sync</span>
      </Button>
    </div>
  );
}
