import { useMemo } from 'react';
import Comment from './components/Comment';
import CommentForm from './components/CommentForm';
import UserForm from './components/UserForm';
import { UserProvider } from './context/user';
import { RootProvider, RootConsumer } from './context/root';

/**
 * Memoized comment list component.
 * Optimizations implemented:
 * 1. O(N) deduplication using Set instead of O(N²) filter + findIndex.
 * 2. Precomputing sort timestamps in O(N) pass to avoid tag filtering/mapping allocations inside Array.prototype.sort comparator.
 * 3. Memoizing processed comments via useMemo.
 * 4. Stable React keys (`comment.id`) instead of array index `i`.
 */
function CommentList({ comments }) {
  const processedComments = useMemo(() => {
    if (!comments || comments.length === 0) return [];

    const _times = {};
    const seen = new Set();
    const uniqueComments = [];

    // O(N) deduplication & time map creation
    for (let i = 0; i < comments.length; i++) {
      const item = comments[i];
      if (!item || !item.id) continue;
      _times[item.id] = item.created_at;
      if (!seen.has(item.id)) {
        seen.add(item.id);
        uniqueComments.push(item);
      }
    }

    // O(N) precomputation of parent sort times to avoid array allocations inside sort comparator
    const sortTimes = new Map();
    for (let i = 0; i < uniqueComments.length; i++) {
      const item = uniqueComments[i];
      let parentId = null;
      let eCount = 0;

      if (Array.isArray(item.tags)) {
        for (let j = 0; j < item.tags.length; j++) {
          const t = item.tags[j];
          if (t && t[0] === 'e') {
            eCount++;
            parentId = t[1];
          }
        }
      }

      if (eCount > 1 && parentId && _times[parentId] !== undefined) {
        sortTimes.set(item.id, _times[parentId] - 1);
      } else {
        sortTimes.set(item.id, item.created_at);
      }
    }

    // Fast O(N log N) sort using precomputed effective timestamps
    return uniqueComments.slice().sort((a, b) => {
      const timeA = sortTimes.get(a.id);
      const timeB = sortTimes.get(b.id);
      return timeB - timeA;
    });
  }, [comments]);

  if (processedComments.length === 0) {
    return null;
  }

  return (
    <>
      {processedComments.map((comment) => (
        <Comment key={comment.id} comment={comment} />
      ))}
    </>
  );
}

function App({ config }) {
  return (
    <RootProvider config={config}>
      <UserProvider>
        <div className="relative text-left mx-auto px-2 sm:px-4">
            <UserForm />
            <CommentForm />
            <div>
              <RootConsumer>
                {({ comments }) => <CommentList comments={comments} />}
              </RootConsumer>
            </div>
          </div>
      </UserProvider>
    </RootProvider>
  )
}

export default App
