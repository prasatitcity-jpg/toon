import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Issue, User, TicketNotification, CategoryMeta, CategoryType } from '../types';
import { INITIAL_ISSUES, INITIAL_USERS } from '../data/mockData';
import { CATEGORIES } from '../data/categories';
import { recompressDataUrl } from '../utils/imageUpload';

const ISSUES_COLLECTION = 'issues';
const USERS_COLLECTION = 'users';
const NOTIFICATIONS_COLLECTION = 'notifications';
const CATEGORIES_COLLECTION = 'category_settings';

/**
 * Recursively strips all keys with `undefined` values from an object or array.
 * Firestore `setDoc`, `updateDoc`, and `writeBatch` strictly reject `undefined` values.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) =>
        typeof item === 'object' && item !== null ? sanitizeForFirestore(item) : item
      ) as unknown as T;
  }
  if (typeof data === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (value !== undefined) {
        cleaned[key] =
          typeof value === 'object' && value !== null ? sanitizeForFirestore(value) : value;
      }
    }
    return cleaned as T;
  }
  return data;
}

// --- ISSUES SERVICE ---

export function subscribeToIssues(
  onUpdate: (issues: Issue[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const colRef = collection(db, ISSUES_COLLECTION);

  return onSnapshot(
    colRef,
    async (snapshot) => {
      if (snapshot.empty) {
        // Seed initial issues if empty
        console.log('Firestore: issues collection is empty, seeding defaults...');
        try {
          await seedInitialIssues();
        } catch (e) {
          console.error('Error seeding issues in Firestore:', e);
        }
        return;
      }

      const issues: Issue[] = [];
      snapshot.forEach((d) => {
        issues.push({ ...(d.data() as Issue), id: d.id });
      });

      // Sort by newest createdAt
      issues.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      onUpdate(issues);
    },
    (err) => {
      console.error('Firestore onSnapshot error for issues:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Ensures an issue document strictly respects Firestore's 1,048,576 bytes (1 MiB) limit.
 * It deduplicates repeated data URLs in timeline entries and re-compresses any oversized
 * base64 image strings so the document size is guaranteed to stay safely under 750 KB.
 */
export async function prepareSafeIssueForFirestore(issue: Issue): Promise<Issue> {
  const cleaned: Issue = { ...issue };

  // 1. Clean timeline entries: do NOT duplicate large base64 photos in timeline entries
  if (cleaned.timeline && cleaned.timeline.length > 0) {
    cleaned.timeline = cleaned.timeline.map((entry) => {
      if (entry.photoUrl && entry.photoUrl.startsWith('data:')) {
        // If identical to imageUrl or afterImageUrl, or large base64, omit from timeline entry
        if (
          entry.photoUrl === cleaned.imageUrl ||
          entry.photoUrl === cleaned.afterImageUrl ||
          entry.photoUrl.length > 30000
        ) {
          return { ...entry, photoUrl: undefined };
        }
      }
      return entry;
    });
  }

  // 2. Re-compress before image if it's a large data URL
  if (cleaned.imageUrl && cleaned.imageUrl.startsWith('data:image/') && cleaned.imageUrl.length > 80000) {
    cleaned.imageUrl = await recompressDataUrl(cleaned.imageUrl, 800, 800, 0.70);
  }

  // 3. Re-compress after image if it's a large data URL
  if (cleaned.afterImageUrl && cleaned.afterImageUrl.startsWith('data:image/') && cleaned.afterImageUrl.length > 80000) {
    cleaned.afterImageUrl = await recompressDataUrl(cleaned.afterImageUrl, 800, 800, 0.70);
  }

  // 4. Re-compress additional images and limit quantity if oversized
  if (cleaned.additionalImages && cleaned.additionalImages.length > 0) {
    const safeAdd: string[] = [];
    const sliceList = cleaned.additionalImages.slice(0, 5);
    for (const img of sliceList) {
      if (img.startsWith('data:image/') && img.length > 70000) {
        const recompressed = await recompressDataUrl(img, 680, 680, 0.65);
        safeAdd.push(recompressed);
      } else {
        safeAdd.push(img);
      }
    }
    cleaned.additionalImages = safeAdd;
  }

  // 5. Check total serialized length (Firestore max document size is 1,048,576 bytes)
  let estimatedSize = JSON.stringify(cleaned).length;
  if (estimatedSize > 700000) {
    console.warn(`Issue ${issue.id} size (${estimatedSize} bytes) approaches 1MB limit. Applying high compression...`);
    if (cleaned.imageUrl && cleaned.imageUrl.startsWith('data:')) {
      cleaned.imageUrl = await recompressDataUrl(cleaned.imageUrl, 640, 640, 0.55);
    }
    if (cleaned.afterImageUrl && cleaned.afterImageUrl.startsWith('data:')) {
      cleaned.afterImageUrl = await recompressDataUrl(cleaned.afterImageUrl, 640, 640, 0.55);
    }
    if (cleaned.additionalImages && cleaned.additionalImages.length > 2) {
      cleaned.additionalImages = cleaned.additionalImages.slice(0, 2);
    }
  }

  return cleaned;
}

export async function saveIssueToFirestore(issue: Issue): Promise<void> {
  try {
    const safeIssue = await prepareSafeIssueForFirestore(issue);
    const docRef = doc(db, ISSUES_COLLECTION, safeIssue.id);
    await setDoc(docRef, sanitizeForFirestore(safeIssue));
  } catch (error) {
    console.warn('Primary saveIssueToFirestore failed, attempting emergency compressed save:', error);
    try {
      const minimalIssue: Issue = {
        ...issue,
        imageUrl: issue.imageUrl?.startsWith('data:')
          ? await recompressDataUrl(issue.imageUrl, 500, 500, 0.45)
          : issue.imageUrl,
        afterImageUrl: issue.afterImageUrl?.startsWith('data:')
          ? await recompressDataUrl(issue.afterImageUrl, 500, 500, 0.45)
          : issue.afterImageUrl,
        additionalImages: undefined,
        timeline: issue.timeline?.map((t) => ({ ...t, photoUrl: undefined })),
      };
      const docRef = doc(db, ISSUES_COLLECTION, minimalIssue.id);
      await setDoc(docRef, sanitizeForFirestore(minimalIssue));
      console.log(`Successfully saved issue ${issue.id} to Firestore using emergency compressed payload.`);
    } catch (fallbackError) {
      console.error('Failed to save issue to Firestore even after compression:', fallbackError);
      throw error;
    }
  }
}

export async function updateIssueInFirestore(
  issueId: string,
  updates: Partial<Issue>
): Promise<void> {
  try {
    const safeUpdates: Partial<Issue> = { ...updates };

    if (safeUpdates.imageUrl && safeUpdates.imageUrl.startsWith('data:') && safeUpdates.imageUrl.length > 80000) {
      safeUpdates.imageUrl = await recompressDataUrl(safeUpdates.imageUrl, 800, 800, 0.70);
    }
    if (safeUpdates.afterImageUrl && safeUpdates.afterImageUrl.startsWith('data:') && safeUpdates.afterImageUrl.length > 80000) {
      safeUpdates.afterImageUrl = await recompressDataUrl(safeUpdates.afterImageUrl, 800, 800, 0.70);
    }
    if (safeUpdates.additionalImages && safeUpdates.additionalImages.length > 0) {
      const compressedAdd: string[] = [];
      for (const img of safeUpdates.additionalImages.slice(0, 5)) {
        if (img.startsWith('data:') && img.length > 70000) {
          compressedAdd.push(await recompressDataUrl(img, 680, 680, 0.65));
        } else {
          compressedAdd.push(img);
        }
      }
      safeUpdates.additionalImages = compressedAdd;
    }
    if (safeUpdates.timeline) {
      safeUpdates.timeline = safeUpdates.timeline.map((t) => {
        if (t.photoUrl && t.photoUrl.startsWith('data:') && t.photoUrl.length > 30000) {
          return { ...t, photoUrl: undefined };
        }
        return t;
      });
    }

    const docRef = doc(db, ISSUES_COLLECTION, issueId);
    await updateDoc(
      docRef,
      sanitizeForFirestore({
        ...safeUpdates,
        updatedAt: new Date().toISOString(),
      })
    );
  } catch (error) {
    console.warn(`Primary updateIssueInFirestore for ${issueId} failed, attempting compressed setDoc merge:`, error);
    try {
      const docRef = doc(db, ISSUES_COLLECTION, issueId);
      const safeUpdates: Partial<Issue> = { ...updates };
      if (safeUpdates.imageUrl && safeUpdates.imageUrl.startsWith('data:')) {
        safeUpdates.imageUrl = await recompressDataUrl(safeUpdates.imageUrl, 550, 550, 0.50);
      }
      if (safeUpdates.afterImageUrl && safeUpdates.afterImageUrl.startsWith('data:')) {
        safeUpdates.afterImageUrl = await recompressDataUrl(safeUpdates.afterImageUrl, 550, 550, 0.50);
      }
      if (safeUpdates.timeline) {
        safeUpdates.timeline = safeUpdates.timeline.map((t) => ({ ...t, photoUrl: undefined }));
      }
      await setDoc(
        docRef,
        sanitizeForFirestore({
          ...safeUpdates,
          updatedAt: new Date().toISOString(),
        }),
        { merge: true }
      );
      console.log(`Successfully updated issue ${issueId} in Firestore using setDoc merge.`);
    } catch (fallbackError) {
      console.error(`Failed to update issue ${issueId} in Firestore:`, fallbackError);
      throw error;
    }
  }
}

export async function seedInitialIssues(): Promise<void> {
  const batch = writeBatch(db);
  INITIAL_ISSUES.forEach((issue) => {
    const docRef = doc(db, ISSUES_COLLECTION, issue.id);
    batch.set(docRef, sanitizeForFirestore(issue));
  });
  await batch.commit();
}

// --- USERS SERVICE ---

export function subscribeToUsers(
  onUpdate: (users: User[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const colRef = collection(db, USERS_COLLECTION);

  return onSnapshot(
    colRef,
    async (snapshot) => {
      if (snapshot.empty) {
        console.log('Firestore: users collection is empty, seeding defaults...');
        try {
          await seedInitialUsers();
        } catch (e) {
          console.error('Error seeding users in Firestore:', e);
        }
        return;
      }

      const users: User[] = [];
      snapshot.forEach((d) => {
        users.push({ ...(d.data() as User), id: d.id });
      });
      onUpdate(users);
    },
    (err) => {
      console.error('Firestore onSnapshot error for users:', err);
      if (onError) onError(err);
    }
  );
}

export async function saveUserToFirestore(user: User): Promise<void> {
  try {
    const docRef = doc(db, USERS_COLLECTION, user.id);
    await setDoc(docRef, sanitizeForFirestore(user));
  } catch (error) {
    console.error('Failed to save user to Firestore:', error);
    throw error;
  }
}

export async function deleteUserFromFirestore(userId: string): Promise<void> {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Failed to delete user ${userId} from Firestore:`, error);
    throw error;
  }
}

export async function seedInitialUsers(): Promise<void> {
  const batch = writeBatch(db);
  INITIAL_USERS.forEach((user) => {
    const docRef = doc(db, USERS_COLLECTION, user.id);
    batch.set(docRef, sanitizeForFirestore(user));
  });
  await batch.commit();
}

// --- NOTIFICATIONS SERVICE ---

export function subscribeToNotifications(
  onUpdate: (notifications: TicketNotification[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const colRef = collection(db, NOTIFICATIONS_COLLECTION);

  return onSnapshot(
    colRef,
    (snapshot) => {
      const notifs: TicketNotification[] = [];
      snapshot.forEach((d) => {
        notifs.push({ ...(d.data() as TicketNotification), id: d.id });
      });
      notifs.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      onUpdate(notifs);
    },
    (err) => {
      console.error('Firestore onSnapshot error for notifications:', err);
      if (onError) onError(err);
    }
  );
}

export async function saveNotificationToFirestore(
  notification: TicketNotification
): Promise<void> {
  try {
    const docRef = doc(db, NOTIFICATIONS_COLLECTION, notification.id);
    await setDoc(docRef, sanitizeForFirestore(notification));
  } catch (error) {
    console.error('Failed to save notification to Firestore:', error);
    throw error;
  }
}

export async function markAllNotificationsReadInFirestore(
  notifications: TicketNotification[]
): Promise<void> {
  try {
    const unread = notifications.filter((n) => !n.isRead);
    if (unread.length === 0) return;
    const batch = writeBatch(db);
    unread.forEach((n) => {
      const docRef = doc(db, NOTIFICATIONS_COLLECTION, n.id);
      batch.update(docRef, { isRead: true });
    });
    await batch.commit();
  } catch (error) {
    console.error('Failed to mark notifications read in Firestore:', error);
  }
}

// --- RESET DATABASE ---

export async function resetDatabaseToDefaults(): Promise<void> {
  // Overwrite issues
  const issuesBatch = writeBatch(db);
  INITIAL_ISSUES.forEach((issue) => {
    const docRef = doc(db, ISSUES_COLLECTION, issue.id);
    issuesBatch.set(docRef, sanitizeForFirestore(issue));
  });
  await issuesBatch.commit();

  // Overwrite users
  const usersBatch = writeBatch(db);
  INITIAL_USERS.forEach((user) => {
    const docRef = doc(db, USERS_COLLECTION, user.id);
    usersBatch.set(docRef, sanitizeForFirestore(user));
  });
  await usersBatch.commit();
}

// --- CATEGORY SETTINGS & PHOTO SERVICE ---

export function subscribeToCategorySettings(
  onUpdate: (categories: CategoryMeta[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const colRef = collection(db, CATEGORIES_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate(CATEGORIES);
        return;
      }
      const overrides: Record<string, Partial<CategoryMeta>> = {};
      snapshot.docs.forEach((d) => {
        overrides[d.id] = d.data() as Partial<CategoryMeta>;
      });

      const merged = CATEGORIES.map((cat) => {
        const override = overrides[cat.id];
        if (override && override.realPhotoUrl) {
          return {
            ...cat,
            realPhotoUrl: override.realPhotoUrl,
            photoExamples: override.photoExamples || [
              {
                url: override.realPhotoUrl,
                title: `ภาพจริงอัปเดต (${cat.label})`,
                description: 'ภาพถ่ายจริงที่อัปเดตโดยแอดมิน',
              },
              ...(cat.photoExamples?.filter((p) => p.url !== override.realPhotoUrl) || []),
            ],
          };
        }
        return cat;
      });

      onUpdate(merged);
    },
    (err) => {
      console.warn('Firestore onSnapshot error for category_settings:', err);
      if (onError) onError(err);
    }
  );
}

export async function saveCategoryPhotoToFirestore(
  catId: CategoryType,
  newPhotoUrl: string,
  updatedBy?: string
): Promise<void> {
  try {
    // Recompress image if it is a data URL to protect Firestore limits (~30-60KB)
    let safeUrl = newPhotoUrl;
    if (safeUrl.startsWith('data:image/')) {
      safeUrl = await recompressDataUrl(safeUrl, 800, 800, 0.75);
    }

    const docRef = doc(db, CATEGORIES_COLLECTION, catId);
    await setDoc(
      docRef,
      sanitizeForFirestore({
        id: catId,
        realPhotoUrl: safeUrl,
        updatedAt: new Date().toISOString(),
        updatedBy: updatedBy || 'แอดมิน',
      }),
      { merge: true }
    );
  } catch (error) {
    console.error(`Failed to save category photo for ${catId} to Firestore:`, error);
    throw error;
  }
}

export async function resetCategoryPhotoInFirestore(catId: CategoryType): Promise<void> {
  try {
    const docRef = doc(db, CATEGORIES_COLLECTION, catId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Failed to reset category photo for ${catId} in Firestore:`, error);
  }
}

