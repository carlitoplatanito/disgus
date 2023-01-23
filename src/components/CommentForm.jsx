import { useState } from 'react';
import { postComment } from '../helpers/nostr';
import { EllipsisHorizontalCircleIcon, InformationCircleIcon, PencilSquareIcon, BookmarkIcon, ShareIcon } from '@heroicons/react/24/outline';
import { useUser } from '../context/user';
import { useRoot } from '../context/root';
import Button from './Button';

export default function CommentForm() {
    const { config, rootEvent, createRoot, refreshComments } = useRoot();
    const { pubkey, relays } = config;
    const [ comment, setComment ] = useState('');
    const [ focused, setFocused ] = useState(false);
    const { user, signIn, signInRandom } = useUser();
    
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

    let focusTimer = setTimeout(()=>{}, 0);

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
            clearTimeout(focusTimer);
            setFocused(true);
        }}
        onBlur={(e) => {
            focusTimer = setTimeout(() => setFocused(false), 100);
        }}
        >
            <textarea
                className="w-full p-2 m-0 bg-white text-black focus:outline-none"
                id="comment"
                placeholder="Join the discussion..."
                value={comment}
                rows={focused || comment.length > 0 ? 3 : 1}
                onChange={(e) => {
                    setComment(e.target.value);
                }}
            />
            {(focused || comment.length > 0) && 
            <div className="bg-gray-100 text-black m-0 px-2 py-1 flex items-center justify-between">
                {rootEvent
                    ? <a className="block whitespace-nowrap truncate" rel="nostr:event" href={`nostr:e:${rootEvent.id}`} title={`re: ${rootEvent.id}`}><PencilSquareIcon  className="inline-block" width={18} /> {rootEvent.id}</a>
                    : <EllipsisHorizontalCircleIcon width={18} />
                }
                {user ?
                <Button type="submit" variant="primary">
                    Comment
                </Button>:
                <div className="whitespace-nowrap">
                    <Button type="button" variant="primary" className="mr-2" key="plugin" onClick={(e) => { e.preventDefault(); signIn(); }}>
                        Sign In
                    </Button>
                    <Button type="button" variant="primary" key="random" onClick={(e) => { e.preventDefault(); signInRandom(); }}>
                        Random Guest
                    </Button>
                </div>
                }
            </div>}
        </form>
        <div className="my-3 mx-1">
            <Button variant="secondary" className="hidden mr-2"><BookmarkIcon className="-mt-1 mr-1 w-6 h-6 inline-block" /><b>0</b></Button>
            <Button variant="secondary" Component="a" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURI(config.canonical)}`} target="_blank"><ShareIcon className="-mt-1 mr-1 w-6 h-6 inline-block" /><b>Share</b></Button>
        </div>
        </>
    );
}