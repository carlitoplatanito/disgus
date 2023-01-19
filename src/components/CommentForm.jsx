import { useState } from 'react';
import { postComment, createRootEvent, getComments } from '../helpers/nostr';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/solid';
import { useUser } from '../context/user';
import { useRoot } from '../context/root';

export default function CommentForm() {
    const { config, rootEvent, refreshComments } = useRoot();
    const { title, pubkey, relays, canonical } = config;
    const [ comment, setComment ] = useState('');
    const { user } = useUser();
    
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
        <form className="pt-4" aria-disabled={!user} onSubmit={
            (e)=>{
                e.preventDefault();
                if (rootEvent) {
                    createComment(rootEvent.id);
                } else {
                    createRootEvent(config, user).then(async (_event) => {
                        await setRootEvent(_event);
                        createComment(_event.id);
                    });
                }
            }
        }>
            <div className="mt-2">
                <textarea
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="comment"
                    placeholder="What do you have to say?"
                    value={comment}
                    onChange={(e) => {
                        setComment(e.target.value);
                    }}
                />
                <div className="text-sm">
                    {rootEvent
                        ? <p>In reply to <a className="underline" rel="root" href={`nostr:e:${rootEvent.id}`}>{title}</a></p>
                        : <p>Be the first to comment</p>}
                </div>
            </div>
            {user && <div className="flex items-center justify-start">
                <button type="submit" disabled={!user}  className="bg-black text-white font-bold py-2 px-4 rounded">
                    Comment
                </button>
                <div className="ml-2">as <a target="_blank" href={`nostr:p:${user.pubKey}`}>{user.name || user.pubkey}</a></div>
            </div>}
        </form>
    );
}