import { useState } from 'react';
import { postComment, createChannel } from '../helpers/nostr';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/solid'

export default function CommentForm({user, channel, onSetChannel, config}) {
    const { title, admin, relay, image, canonical } = config;
    const [ comment, setComment ] = useState('');

    const handleCreateChannel = (e) => {
        createChannel({user, channel: { name: title, about: canonical, picture: image }}).then((resp) => {
            onSetChannel(resp);
        })
    }
    
    const createComment = () => {
        if (comment.length > 0) {
            postComment({ user, channel, comment }).then(() => {
                setComment('');
            });
        }
    }

    if (channel) {
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
                            In reply to <a className="underline" href={channel.about}>{channel.name}</a>
                            <a href={`nostr:${channel.id}`} title={`#${channel.id}`}><ChatBubbleLeftIcon width={18} className="inline color-gray-500" /></a>
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
    } else {
        return (
            <div>
                <h3 className="text-lg">No channel available</h3>
                <a href={canonical} className="text-gray-500 block" target="_blank">{canonical}</a>
                {
                    user && user.pubkey === admin ?
                        <button type="submit" onClick={handleCreateChannel} className="mt-2 bg-green-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                            Create Channel
                        </button>
                    : ''
                }
            </div>
        );
    }
}