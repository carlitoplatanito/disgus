import { useState } from 'react';
import { postComment, createRootEvent, getComments } from '../helpers/nostr';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/solid'

export default function CommentForm({ user, rootEvent, setRootEvent, setComments, config }) {
    const { title, pubkey, relays, canonical } = config;
    const [ comment, setComment ] = useState('');
    
    const createComment = async () => {
        const tags = [['e', rootEvent.id, relays[0], 'root']];
        if (pubkey) {
            tags.push(['p', pubkey]);
        }
        tags.push(['client', 'Disgus']);

        if (comment.length > 0) {
            postComment({
                pubkey: user.pubkey,
                content: comment,
                tags
            }, user.privateKey, relays).then(() => {
                setComment('');
                getComments(config, rootEvent).then((_comments) => {
                    setComments(_comments);
                });
            });
        }
    }

    return (
        <form className="py-4" onSubmit={
            (e)=>{
                e.preventDefault();
                createComment();
            }
        }>
            <div className="mt-2">
                <textarea
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="comment"
                    placeholder="What do you have to say?"
                    value={comment}
                    onChange={(e) => {
                        if (!rootEvent && user) {
                            createRootEvent(config, user).then((_root) => setRootEvent(_root));
                        } else {
                            setComment(e.target.value);
                        }
                    }}
                />
                <div className="text-sm">
                    {rootEvent
                        ? <p>In reply to <a className="underline" rel="root" href={`nostr:e:${rootEvent.id}`}>{title}</a></p>
                        : <p>Be the first to comment</p>}
                </div>
            </div>
            {user &&
            <div className="flex items-center justify-between">
                <button type="submit" className="bg-black text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                    Comment
                </button>
            </div>
            }
        </form>
    );
}