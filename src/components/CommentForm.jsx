import { useState } from 'react';
import { postComment } from '../helpers/nostr';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/solid'

export default function CommentForm({user, config}) {
    const { title, relay, canonical } = config;
    const [ comment, setComment ] = useState('');
    
    const createComment = () => {
        if (comment.length > 0) {
            postComment({
                pubkey: user.pubkey,
                content: comment,
                // subject: `re: [${title}](${canonical})`,
                tags: [
                    ['r', canonical],
                    ['client', 'Disgus']
                ]
            }, user.privateKey, relay).then(() => {
                setComment('');
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
                    onChange={(e)=>setComment(e.target.value)}
                />
                <div className="text-sm">
                    <p>
                        In reply to <a className="underline" href={canonical}>{title}</a>
                    </p>
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