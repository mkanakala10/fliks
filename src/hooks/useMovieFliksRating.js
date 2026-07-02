import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';

export function useMovieFliksRating(movieId) {
  const [fliksRating, setFliksRating] = useState({
    average: 0,
    count: 0,
    reviews: [],
    isLoading: true,
  });

  useEffect(() => {
    if (!isFirebaseConfigured || !db || !movieId) {
      setFliksRating({ average: 0, count: 0, reviews: [], isLoading: false });
      return undefined;
    }

    const ratingsRef = collection(db, 'movies', String(movieId), 'userRatings');
    const q = query(ratingsRef, orderBy('updatedAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let sum = 0;
        let count = 0;
        const reviews = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          if (typeof data.rating === 'number') {
            sum += data.rating;
            count += 1;
          }
          if (data.reviewText || data.rating) {
            reviews.push({
              userId: doc.id,
              rating: data.rating,
              reviewText: data.reviewText || '',
              username: data.username || 'Anonymous User',
              updatedAt: data.updatedAt?.toDate() || new Date(),
            });
          }
        });

        const average = count > 0 ? Number((sum / count).toFixed(1)) : 0;
        setFliksRating({ average, count, reviews, isLoading: false });
      },
      (error) => {
        console.error('Error fetching Fliks ratings:', error);
        // Fallback in case of index issues or permission errors
        const unsubscribeUnordered = onSnapshot(
          ratingsRef,
          (snapshot) => {
            let sum = 0;
            let count = 0;
            const reviews = [];
            snapshot.forEach((doc) => {
              const data = doc.data();
              if (typeof data.rating === 'number') {
                sum += data.rating;
                count += 1;
              }
              reviews.push({
                userId: doc.id,
                rating: data.rating,
                reviewText: data.reviewText || '',
                username: data.username || 'Anonymous User',
                updatedAt: data.updatedAt?.toDate() || new Date(),
              });
            });
            const average = count > 0 ? Number((sum / count).toFixed(1)) : 0;
            setFliksRating({ average, count, reviews, isLoading: false });
          },
          (err) => {
            console.error('Unordered Fliks ratings fetch also failed:', err);
            setFliksRating({ average: 0, count: 0, reviews: [], isLoading: false });
          }
        );
        return () => unsubscribeUnordered();
      }
    );

    return () => unsubscribe();
  }, [movieId]);

  return fliksRating;
}
