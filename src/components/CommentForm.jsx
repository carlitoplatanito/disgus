import { useEffect, useState } from 'react';
import { formatDate } from "../helpers/utils";
import { getUser, postComment, createChannel } from '../helpers/nostr';
import { CheckBadgeIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/solid'

export default function CommentForm({user, channel, onSetChannel, config}) {
    const { title, admin, relay, image, canonical } = config;
    const [ comment, setComment ] = useState('');

    const handleCreateChannel = (e) => {
        createChannel(relay, {name: title, about: canonical, picture: image}).then((resp) => {
            onSetChannel(resp);
        })
    }
    
    const createComment = () => {
        if (comment.length > 0) {
            postComment({ user, channel, comment }, relay).then(() => {
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
                    >
                    </textarea>
                    <div className="text-sm">
                        In reply to <a className="underline" href={channel.about}>{channel.name}</a> <a href={`nostr:${channel.id}`} title={`#${channel.id}`}><ChatBubbleLeftIcon width={18} className="inline color-gray-500" /></a>
                    </div>
                </div>
               {user && <div className="flex items-center justify-between">
                    <button type="submit" className="bg-black text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        Comment
                    </button>
                </div>}
            </form>
        )
    }

    if (!channel) {
        return (
            <div>
                <h3 className="text-lg">No channel for <b>{title}</b></h3>
                <p className="text-gray-500"><b>URL:</b> <a href={canonical} target="_blank">{canonical}</a></p>
                {
                    user && user.pubkey === admin &&
                        <button type="submit" onClick={handleCreateChannel} className="mt-2 bg-green-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                            Create Channel
                        </button>
                }
            </div>
        )
    }

    return <></>
}