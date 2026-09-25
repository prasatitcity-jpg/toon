import { INITIAL_ISSUES, INITIAL_USERS } from '../data/mockData';
import { Issue, User, CategoryMeta, CategoryType } from '../types';
import { CATEGORIES } from '../data/categories';

const STORAGE_KEY_ISSUES = 'community_care_issues_v1';
const STORAGE_KEY_USER = 'community_care_active_user_v1';
const STORAGE_KEY_USERS_LIST = 'community_care_all_users_v1';
const STORAGE_KEY_AUTH_STATUS = 'community_care_auth_status_v3';
const STORAGE_KEY_REMEMBER_ME = 'community_care_remember_me_v1';
const STORAGE_KEY_CATEGORIES = 'community_care_categories_v1';

export function getStoredIsLoggedIn(): boolean {
  try {
    // Clear any previous legacy keys that defaulted to true
    localStorage.removeItem('community_care_auth_status_v1');
    localStorage.removeItem('community_care_auth_status_v2');

    const val = localStorage.getItem(STORAGE_KEY_AUTH_STATUS);
    // MUST default to false so the Login Screen appears when entering the app
    if (val === 'true') return true;
    return false;
  } catch {
    return false;
  }
}

export function saveStoredIsLoggedIn(isLoggedIn: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY_AUTH_STATUS, String(isLoggedIn));
  } catch (e) {
    console.error('Failed to save auth status', e);
  }
}

export function getStoredRememberMe(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY_REMEMBER_ME) === 'true';
  } catch {
    return true;
  }
}

export function saveStoredRememberMe(remember: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY_REMEMBER_ME, String(remember));
  } catch (e) {
    console.error('Failed to save remember me', e);
  }
}

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
    // Sanitize issues for localStorage by trimming huge base64 data URLs > 50KB
    // so they do not exhaust the browser's 5MB localStorage domain quota.
    const lightweightIssues = issues.map((issue) => {
      let img = issue.imageUrl;
      let afterImg = issue.afterImageUrl;
      let addImgs = issue.additionalImages;

      if (img && img.startsWith('data:') && img.length > 50000) {
        // Keep a short thumbnail/stub in localStorage cache
        img = img.slice(0, 50000);
      }
      if (afterImg && afterImg.startsWith('data:') && afterImg.length > 50000) {
        afterImg = afterImg.slice(0, 50000);
      }
      if (addImgs && addImgs.length > 0) {
        addImgs = addImgs.map((ai) =>
          ai.startsWith('data:') && ai.length > 30000 ? ai.slice(0, 30000) : ai
        );
      }

      return {
        ...issue,
        imageUrl: img,
        afterImageUrl: afterImg,
        additionalImages: addImgs,
        timeline: issue.timeline?.map((tl) => ({
          ...tl,
          photoUrl:
            tl.photoUrl && tl.photoUrl.startsWith('data:') && tl.photoUrl.length > 15000
              ? undefined
              : tl.photoUrl,
        })),
      };
    });

    localStorage.setItem(STORAGE_KEY_ISSUES, JSON.stringify(lightweightIssues));
  } catch (e) {
    console.warn('LocalStorage quota warning, falling back to minimal issues cache:', e);
    try {
      // Emergency fallback: remove all base64 data URLs from localStorage cache
      const minimalIssues = issues.map((iss) => ({
        ...iss,
        imageUrl: iss.imageUrl?.startsWith('data:') ? '' : iss.imageUrl,
        afterImageUrl: iss.afterImageUrl?.startsWith('data:') ? '' : iss.afterImageUrl,
        additionalImages: iss.additionalImages?.filter((img) => !img.startsWith('data:')),
        timeline: iss.timeline?.map((tl) => ({
          ...tl,
          photoUrl: tl.photoUrl?.startsWith('data:') ? undefined : tl.photoUrl,
        })),
      }));
      localStorage.setItem(STORAGE_KEY_ISSUES, JSON.stringify(minimalIssues));
    } catch {
      // If even minimal fails, do not throw or crash
    }
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

export function getStoredCategories(): CategoryMeta[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    if (data) {
      const parsed: CategoryMeta[] = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return CATEGORIES.map((cat) => {
          const match = parsed.find((p) => p.id === cat.id);
          return match ? { ...cat, ...match } : cat;
        });
      }
    }
  } catch (e) {
    console.error('Failed to parse categories from localStorage:', e);
  }
  return CATEGORIES;
}

export function saveStoredCategories(categories: CategoryMeta[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  } catch (e) {
    console.warn('Failed to save categories to localStorage:', e);
  }
}

export function updateStoredCategoryPhoto(catId: CategoryType, newPhotoUrl: string): CategoryMeta[] {
  const current = getStoredCategories();
  const updated = current.map((cat) => {
    if (cat.id === catId) {
      return {
        ...cat,
        realPhotoUrl: newPhotoUrl,
        photoExamples: [
          { url: newPhotoUrl, title: `ภาพจริงอัปเดต (${cat.label})`, description: 'ภาพถ่ายจริงที่อัปเดตโดยแอดมิน' },
          ...(cat.photoExamples?.filter((p) => p.url !== newPhotoUrl) || []),
        ],
      };
    }
    return cat;
  });
  saveStoredCategories(updated);
  return updated;
}

