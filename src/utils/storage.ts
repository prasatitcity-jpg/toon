import { INITIAL_ISSUES, INITIAL_USERS } from '../data/mockData';
import { Issue, User } from '../types';

const STORAGE_KEY_ISSUES = 'community_care_issues_v1';
const STORAGE_KEY_USER = 'community_care_active_user_v1';
const STORAGE_KEY_USERS_LIST = 'community_care_all_users_v1';

export function getStoredIssues(): Issue[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_ISSUES);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to parse issues from localStorage', e);
  }
  // Initialize with mock data
  saveStoredIssues(INITIAL_ISSUES);
  return INITIAL_ISSUES;
}

export function saveStoredIssues(issues: Issue[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ISSUES, JSON.stringify(issues));
  } catch (e) {
    console.error('Failed to save issues to localStorage', e);
  }
}

export function getStoredUsers(): User[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_USERS_LIST);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to parse users from localStorage', e);
  }
  saveStoredUsers(INITIAL_USERS);
  return INITIAL_USERS;
}

export function saveStoredUsers(users: User[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_USERS_LIST, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users to localStorage', e);
  }
}

export function getStoredCurrentUser(): User {
  try {
    const data = localStorage.getItem(STORAGE_KEY_USER);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to parse active user from localStorage', e);
  }
  // Default to citizen demo user
  const defaultUser = INITIAL_USERS[0];
  saveStoredCurrentUser(defaultUser);
  return defaultUser;
}

export function saveStoredCurrentUser(user: User): void {
  try {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save active user to localStorage', e);
  }
}

export function resetToDemoData(): { issues: Issue[]; users: User[]; user: User } {
  localStorage.removeItem(STORAGE_KEY_ISSUES);
  localStorage.removeItem(STORAGE_KEY_USERS_LIST);
  localStorage.removeItem(STORAGE_KEY_USER);
  saveStoredIssues(INITIAL_ISSUES);
  saveStoredUsers(INITIAL_USERS);
  saveStoredCurrentUser(INITIAL_USERS[0]);
  return {
    issues: INITIAL_ISSUES,
    users: INITIAL_USERS,
    user: INITIAL_USERS[0],
  };
}

export function formatThaiDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function formatRelativeThaiTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return 'เมื่อสักครู่';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} ชั่วโมงที่แล้ว`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay} วันที่แล้ว`;
    return formatThaiDate(isoString);
  } catch {
    return isoString;
  }
}

export function generateTicketCode(existingIssues: Issue[]): string {
  const currentYear = new Date().getFullYear();
  const nextNum = existingIssues.length + 1;
  const pad = String(nextNum).padStart(3, '0');
  return `CC-${currentYear}-${pad}`;
}
