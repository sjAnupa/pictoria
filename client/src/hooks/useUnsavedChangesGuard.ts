import { useCallback, useEffect, useState } from 'react'

type LeaveDialogState = {
  open: boolean
  resolve: ((value: boolean) => void) | null
}

export function useUnsavedChangesGuard({
  isDirty,
  onSaveDraft,
}: {
  isDirty: boolean
  onSaveDraft: () => Promise<boolean>
}) {
  const [leaveDialog, setLeaveDialog] = useState<LeaveDialogState>({
    open: false,
    resolve: null,
  })

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (!isDirty) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  const requestLeave = useCallback((): Promise<boolean> => {
    if (!isDirty) return Promise.resolve(true)
    return new Promise((resolve) => {
      setLeaveDialog({ open: true, resolve })
    })
  }, [isDirty])

  const closeLeaveDialog = useCallback((result: boolean) => {
    setLeaveDialog((current) => {
      current.resolve?.(result)
      return { open: false, resolve: null }
    })
  }, [])

  const handleSaveAndLeave = useCallback(async () => {
    const saved = await onSaveDraft()
    closeLeaveDialog(saved)
  }, [closeLeaveDialog, onSaveDraft])

  const handleDiscardAndLeave = useCallback(() => {
    closeLeaveDialog(true)
  }, [closeLeaveDialog])

  const handleStay = useCallback(() => {
    closeLeaveDialog(false)
  }, [closeLeaveDialog])

  return {
    leaveDialogOpen: leaveDialog.open,
    requestLeave,
    handleSaveAndLeave,
    handleDiscardAndLeave,
    handleStay,
  }
}
