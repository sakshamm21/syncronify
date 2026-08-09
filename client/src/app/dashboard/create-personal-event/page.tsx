"use client"

import CreateEvent from '@/components/CreateEvent/CreateEvent'
import React, { useState } from 'react'

const personalEvents = () => {
  const [isCreateActive, setIsCreateActive] = useState(true);

  const handleCreateActive = (toggleActive: boolean | ((prevState: boolean) => boolean)) => {
    setIsCreateActive(toggleActive);
  };

  const handleBrowseMap = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  return (
    <CreateEvent isCreateActive={isCreateActive} handleCreateActive={handleCreateActive} handleBrowseMap={handleBrowseMap} />
  )
}

export default personalEvents