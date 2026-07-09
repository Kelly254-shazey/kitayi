import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut,
  updateProfile,
  type UserCredential,
} from 'firebase/auth';
import { ref, set, get, child } from 'firebase/database';
import { auth, db } from './firebase';
import type { User } from '../context/authContext';

const DB_USERS_PATH = 'users';

function firebaseUserToAppUser(fbUser: { uid: string; email: string | null; displayName: string | null }): User {
  const email = fbUser.email || '';
  return {
    id: fbUser.uid,
    email,
    user_type: 'Residential',
    full_name: fbUser.displayName || email.split('@')[0] || 'User',
    is_email_verified: true,
    account_number: undefined,
  };
}

export async function firebaseRegister(email: string, password: string, fullName: string): Promise<User> {
  const cred: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: fullName });
  const userData = { email, full_name: fullName, user_type: 'Residential', created_at: new Date().toISOString() };
  await set(ref(db, `${DB_USERS_PATH}/${cred.user.uid}`), userData);
  return { ...firebaseUserToAppUser(cred.user), full_name: fullName };
}

export async function firebaseLogin(email: string, password: string): Promise<User> {
  const cred: UserCredential = await signInWithEmailAndPassword(auth, email, password);
  const snapshot = await get(child(ref(db), `${DB_USERS_PATH}/${cred.user.uid}`));
  const profile = snapshot.val() || {};
  return {
    ...firebaseUserToAppUser(cred.user),
    full_name: profile.full_name || cred.user.displayName || email.split('@')[0],
    user_type: profile.user_type || 'Residential',
    account_number: profile.account_number,
  };
}

export async function firebaseGoogleLogin(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const cred: UserCredential = await signInWithPopup(auth, provider);
  await saveUserToRTDB(cred);
  return firebaseUserToAppUser(cred.user);
}

export async function firebaseFacebookLogin(): Promise<User> {
  const provider = new FacebookAuthProvider();
  provider.setCustomParameters({ display: 'popup' });
  const cred: UserCredential = await signInWithPopup(auth, provider);
  await saveUserToRTDB(cred);
  return firebaseUserToAppUser(cred.user);
}

export async function firebaseGoogleRedirectLogin(): Promise<void> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  await signInWithRedirect(auth, provider);
}

export async function firebaseFacebookRedirectLogin(): Promise<void> {
  const provider = new FacebookAuthProvider();
  provider.setCustomParameters({ display: 'popup' });
  await signInWithRedirect(auth, provider);
}

async function saveUserToRTDB(cred: UserCredential): Promise<void> {
  const snapshot = await get(child(ref(db), `${DB_USERS_PATH}/${cred.user.uid}`));
  if (!snapshot.val()) {
    await set(ref(db, `${DB_USERS_PATH}/${cred.user.uid}`), {
      email: cred.user.email,
      full_name: cred.user.displayName,
      user_type: 'Residential',
      created_at: new Date().toISOString(),
    });
  }
}

export async function handleRedirectResult(): Promise<User | null> {
  const result = await getRedirectResult(auth);
  if (!result) return null;
  await saveUserToRTDB(result);
  return firebaseUserToAppUser(result.user);
}

export async function firebaseLogout(): Promise<void> {
  await signOut(auth);
}

export async function firebaseSaveUserProfile(uid: string, data: Record<string, unknown>): Promise<void> {
  await set(ref(db, `${DB_USERS_PATH}/${uid}`), data);
}
