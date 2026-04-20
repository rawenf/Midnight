import { db } from '../lib/firebase';
import { 
  doc, 
  setDoc, 
  deleteDoc, 
  getDoc, 
  writeBatch, 
  serverTimestamp,
  increment
} from 'firebase/firestore';

export const followUser = async (followerUid: string, followedUid: string) => {
  if (followerUid === followedUid) return;

  const batch = writeBatch(db);
  
  const followingRef = doc(db, 'users', followerUid, 'following', followedUid);
  const followerRef = doc(db, 'users', followedUid, 'followers', followerUid);
  const targetUserRef = doc(db, 'users', followedUid);
  const currentUserRef = doc(db, 'users', followerUid);

  batch.set(followingRef, { createdAt: serverTimestamp() });
  batch.set(followerRef, { createdAt: serverTimestamp() });
  
  // Optionally increment counters if they exist in profileData
  batch.update(targetUserRef, { followersCount: increment(1) });
  batch.update(currentUserRef, { followingCount: increment(1) });

  await batch.commit();
};

export const unfollowUser = async (followerUid: string, followedUid: string) => {
  const batch = writeBatch(db);
  
  const followingRef = doc(db, 'users', followerUid, 'following', followedUid);
  const followerRef = doc(db, 'users', followedUid, 'followers', followerUid);
  const targetUserRef = doc(db, 'users', followedUid);
  const currentUserRef = doc(db, 'users', followerUid);

  batch.delete(followingRef);
  batch.delete(followerRef);
  
  batch.update(targetUserRef, { followersCount: increment(-1) });
  batch.update(currentUserRef, { followingCount: increment(-1) });

  await batch.commit();
};

export const checkFollowStatus = async (followerUid: string, followedUid: string) => {
  const docRef = doc(db, 'users', followerUid, 'following', followedUid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists();
};
