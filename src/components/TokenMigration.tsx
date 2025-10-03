"use client";

import { useEffect } from 'react';
import { migrateFromLocalStorage } from '../utils/secureStorage';

export function TokenMigration() {
  useEffect(() => {
    migrateFromLocalStorage();
  }, []);
  return null;
}
