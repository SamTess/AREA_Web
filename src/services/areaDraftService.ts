import axios from 'axios';
import { API_CONFIG } from '../config/api';

export interface AreaDraft {
  name: string;
  description: string;
  actions: unknown[];
  reactions: unknown[];
  connections: unknown[];
  layoutMode: string;
  draftId?: string;
  savedAt?: string;
}

export interface AreaDraftResponse {
  draftId: string;
  name: string;
  description: string;
  userId: string;
  actions: unknown[];
  reactions: unknown[];
  connections: unknown[];
  layoutMode: string;
  savedAt: string;
  ttlSeconds: number;
}

export const saveDraft = async (draft: AreaDraft): Promise<string> => {
  try {
    const response = await axios.post(
      `${API_CONFIG.endpoints.areas.list}/drafts`,
      draft
    );
    return response.data.draftId;
  } catch (error) {
    console.error('Error saving draft:', error);
    throw error;
  }
};

export const getDraft = async (draftId: string): Promise<AreaDraftResponse> => {
  try {
    const response = await axios.get(
      `${API_CONFIG.endpoints.areas.list}/drafts/${draftId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error getting draft:', error);
    throw error;
  }
};

export const getUserDrafts = async (): Promise<AreaDraftResponse[]> => {
  try {
    const response = await axios.get(
      `${API_CONFIG.endpoints.areas.list}/drafts`
    );
    return response.data;
  } catch (error) {
    console.error('Error getting user drafts:', error);
    throw error;
  }
};

export const commitDraft = async (draftId: string): Promise<unknown> => {
  try {
    const response = await axios.post(
      `${API_CONFIG.endpoints.areas.list}/drafts/${draftId}/commit`
    );
    return response.data;
  } catch (error) {
    console.error('Error committing draft:', error);
    throw error;
  }
};

export const deleteDraft = async (draftId: string): Promise<void> => {
  try {
    await axios.delete(
      `${API_CONFIG.endpoints.areas.list}/drafts/${draftId}`
    );
  } catch (error) {
    console.error('Error deleting draft:', error);
    throw error;
  }
};

export const extendDraftTTL = async (draftId: string): Promise<void> => {
  try {
    await axios.patch(
      `${API_CONFIG.endpoints.areas.list}/drafts/${draftId}/extend`
    );
  } catch (error) {
    console.error('Error extending draft TTL:', error);
    throw error;
  }
};
