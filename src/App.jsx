import { useMemo } from 'react';
import Comment from './components/Comment';
import CommentForm from './components/CommentForm';
import UserForm from './components/UserForm';
import { ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline';
import { UserProvider } from './context/user';
import { RootProvider, RootConsumer } from './context/root';
import { getParentEventId } from './helpers/utils';

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
      const parentId = getParentEventId(item.tags);

      if (parentId && _times[parentId] !== undefined) {
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

  if (!comments) {
    return null;
  }

  if (processedComments.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500" role="status">
        <ChatBubbleLeftEllipsisIcon className="mx-auto h-8 w-8 opacity-60 mb-2" aria-hidden="true" />
        <p className="text-sm">No comments yet. Be the first to share your thoughts!</p>
      </div>
    );
  }

  return (
    <div>
      {processedComments.map((comment) => (
        <Comment key={comment.id} comment={comment} />
      ))}
    </div>
  );
}

function App({ config }) {
  return (
    <RootProvider config={config}>
      <UserProvider>
        <div className="relative text-left mx-auto px-2 sm:px-4">
            <UserForm />
            <CommentForm />
            <section aria-label="Comments">
              <RootConsumer>
                {({ comments }) => <CommentList comments={comments} />}
              </RootConsumer>
            </section>
          </div>
      </UserProvider>
    </RootProvider>
  )
}

export default App
