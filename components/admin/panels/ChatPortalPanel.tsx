'use client'

import PortalChat from '@/components/chat/PortalChat'

export default function ChatPortalPanel() {
  return (
    <div className="space-y-4">
      <PortalChat context="admin" />
    </div>
  )
}

