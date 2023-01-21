import { useEffect, useState } from 'react';
import { formatDate } from "../helpers/utils";
import { getPubkey } from '../helpers/nostr';
import { CheckBadgeIcon, ShieldExclamationIcon, EllipsisHorizontalIcon, MinusIcon, HandThumbUpIcon as HandThumbUpFillIcon, HandThumbDownIcon  as HandThumbDownFillIcon, ArrowUturnLeftIcon, ShareIcon } from '@heroicons/react/24/solid';
import { ClockIcon, HandThumbUpIcon, HandThumbDownIcon, FlagIcon } from '@heroicons/react/24/outline'
import { useRoot } from '../context/root';

export default function Comment({ comment }) {
    const { pubkey, content, created_at } = comment;
    const { config } = useRoot();
    const [ author, setAuthor ] = useState(false);
    const createdDate = new Date(created_at * 1000);

    useEffect(() => {
        if (!author || author.pubkey !== pubkey) {
            getPubkey(pubkey, config.relays).then((_user) => {
                setAuthor(_user);
            });
        }
    }, [author, pubkey]);

    return (
        <div className="p-2 mx-auto">
            <div className="flex items-top justify-between">
                <figure className="avatar mr-4">
                    {author && author.picture
                        ? <img className="object-cover rounded-full w-16 h-16 ring ring-2 ring-black" src={author.picture} style={{backgroundColor: `#${pubkey.substr(0,6)}`, lineHeight: 0}} />
                        : <div className="flex items-center justify-center w-16 h-16 ring ring-2 ring-black rounded-full uppercase text-black" style={{backgroundColor: `#${pubkey.substr(0,6)}`, lineHeight: 0, verticalAlign: 'center'}}><span className="text-3xl">{pubkey.substr(0,2)}</span></div>
                    }
                </figure>
                <div className="flex-grow">
                    <div className="flex items-top justify-between">
                        <div className="flex-grow items-center text-lg">
                            <a href={`nostr:p:${pubkey}`} title={pubkey} className="block truncate">
                                <b>{ author.display_name || author.name || pubkey }</b>
                                { author.nip05 
                                    ? <abbr title={author.nip05.replace('_@', '@')}><CheckBadgeIcon color="purple" className="-mt-1 mx-1 w-4 h-4 inline-block" /></abbr>
                                    : <abbr className="opacity-70" title={`Rando ${pubkey}`}><ShieldExclamationIcon className="-mt-1 mx-1 w-4 h-4 inline-block" /></abbr>
                                }
                            </a>
                            <time className="block text-xs opacity-70" dateTime={createdDate.toISOString()}><ClockIcon className="w-3 h-3 inline" /> {formatDate(createdDate)}</time>
                        </div>
                        <div className="text-right">
                            <MinusIcon className="w-6 h-6 inline-block" />
                            <EllipsisHorizontalIcon className="w-6 h-6 inline-block" />
                        </div>
                    </div>
                    <div className="mt-2 text-md">
                        <p>{content}</p>
                    </div>
                    <div className="mt-2 text-md">
                        <button className="mr-2"><HandThumbUpIcon className="-mt-1 mr-1 w-5 h-5 inline-block" /><span>0</span></button>
                        <button className="mr-2"><HandThumbDownIcon className="-mt-1 mr-1 w-5 h-5  inline-block" /><span>0</span></button>
                        <span className="mx-2">&middot;</span>
                        <button className="mr-2">Reply</button>
                        <span className="mx-2">&middot;</span>
                        <button className="mr-2">Share</button>
                    </div>
                    <hr className="mt-2 mb-4" />
                </div>
            </div>
        </div>
    );
}