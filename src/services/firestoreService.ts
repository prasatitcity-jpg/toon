import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDocs,
  onSnapshot,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Issue, User, TicketNotification } from '../types';
import { INITIAL_ISSUES, INITIAL_USERS } from '../data/mockData';

const ISSUES_COLLECTION = 'issues';
const USERS_COLLECTION = 'users';
const NOTIFICATIONS_COLLECTION = 'notifications';

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

export async function saveIssueToFirestore(issue: Issue): Promise<void> {
  try {
    const docRef = doc(db, ISSUES_COLLECTION, issue.id);
    await setDoc(docRef, issue);
  } catch (error) {
    console.error('Failed to save issue to Firestore:', error);
    throw error;
  }
}

export async function updateIssueInFirestore(
  issueId: string,
  updates: Partial<Issue>
): Promise<void> {
  try {
    const docRef = doc(db, ISSUES_COLLECTION, issueId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`Failed to update issue ${issueId} in Firestore:`, error);
    throw error;
  }
}

export async function seedInitialIssues(): Promise<void> {
  const batch = writeBatch(db);
  INITIAL_ISSUES.forEach((issue) => {
    const docRef = doc(db, ISSUES_COLLECTION, issue.id);
    batch.set(docRef, issue);
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
    await setDoc(docRef, user);
  } catch (error) {
    console.error('Failed to save user to Firestore:', error);
    throw error;
  }
}

export async function seedInitialUsers(): Promise<void> {
  const batch = writeBatch(db);
  INITIAL_USERS.forEach((user) => {
    const docRef = doc(db, USERS_COLLECTION, user.id);
    batch.set(docRef, user);
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
    await setDoc(docRef, notification);
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
    issuesBatch.set(docRef, issue);
  });
  await issuesBatch.commit();

  // Overwrite users
  const usersBatch = writeBatch(db);
  INITIAL_USERS.forEach((user) => {
    const docRef = doc(db, USERS_COLLECTION, user.id);
    usersBatch.set(docRef, user);
  });
  await usersBatch.commit();
}
