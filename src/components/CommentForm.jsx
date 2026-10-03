import { useState, useRef } from 'react';
import { postComment } from '../helpers/nostr';
import { EllipsisHorizontalCircleIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { useUser } from '../context/user';
import { useRoot } from '../context/root';
import Button from './Button';

export default function CommentForm() {
    const { config, rootEvent, createRoot, refreshComments } = useRoot();
    const { pubkey, relays } = config;
    const [ comment, setComment ] = useState('');
    const [ focused, setFocused ] = useState(false);
    const { user, signInExtension, signInRandom } = useUser();
    const focusTimer = useRef();
    
    const createComment = async (rootEventId) => {
        const tags = [['e', rootEventId, relays[0], 'root']];
        if (pubkey) {
            tags.push(['p', pubkey]);
        }
        tags.push(['client', 'Disgus']);

        if (comment.length > 0) {
            postComment({
                pubkey: user.pubkey,
                content: comment,
                tags
            }, user, relays).then(() => {
                setComment('');
                refreshComments();
            });
        }
    }

    return (
        <>
        <form className="shadow relative appearance-none bg-white rounded" aria-disabled={!user} 
        onSubmit={async (e) => {
                e.preventDefault();
                if (rootEvent) {
                    await createComment(rootEvent.id);
                } else {
                    createRoot().then(async (_event) => {
                        await createComment(_event.id);
                    });
                }
        }}
        onFocus={(e) => {
            clearTimeout(focusTimer.current);
            setFocused(true);
        }}
        onBlur={(e) => {
            focusTimer.current = setTimeout(() => setFocused(false), 100);
        }}
        >
            <textarea
                className="w-full p-2 m-0 bg-white text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-inset rounded"
                id="comment"
                aria-label="Add a comment"
                placeholder="Join the discussion..."
                value={comment}
                rows={3}
                onChange={(e) => {
                    setComment(e.target.value);
                }}
            />
            {(focused || comment.length > 0) && 
            <div className="bg-gray-100 text-black m-0 px-2 py-1 flex items-center justify-between">
                {rootEvent
                    ? <a className="block whitespace-nowrap truncate rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black" aria-label={`In reply to Nostr event ${rootEvent.id}`} rel="nostr:event" href={`nostr:e:${rootEvent.id}`} title={`re: ${rootEvent.id}`}><PencilSquareIcon  className="inline-block" width={18} /> {rootEvent.id}</a>
                    : <EllipsisHorizontalCircleIcon width={18} />
                }
                {user ? (
                <Button type="submit" variant="primary">
                    Comment
                </Button>
                ) : (
                <div className="whitespace-nowrap">
                    <Button type="button" variant="primary" className={config?.disable_guest ? "" : "mr-2"} key="plugin" onClick={(e) => { e.preventDefault(); signInExtension(); }}>
                        Sign In
                    </Button>
                    {!config?.disable_guest && (
                    <Button type="button" variant="primary" key="random" onClick={(e) => { e.preventDefault(); signInRandom(); }}>
                        Random Guest
                    </Button>
                    )}
                </div>
                )}
            </div>}
        </form>
        </>
    );
}