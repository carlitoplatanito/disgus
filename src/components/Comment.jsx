import { useEffect, useState } from 'react';
import { formatDate, getParentEventId } from "../helpers/utils";
import { getPubkey } from '../helpers/nostr';
import { CheckBadgeIcon, ShieldExclamationIcon, ArrowUturnDownIcon, MinusIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/solid';
import { ClockIcon, HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/24/outline';
import { useRoot } from '../context/root';

function Comment({ comment }) {
    const { id, pubkey, content, tags, created_at } = comment;
    const { config, rootEvent } = useRoot();
    const [ author, setAuthor ] = useState(false);
    const createdDate = new Date(created_at * 1000);

    const parentEvent = useMemo(() => {
        if (!Array.isArray(tags)) return undefined;
        for (let i = tags.length - 1; i >= 0; i--) {
            if (tags[i] && tags[i][0] === 'e') {
                return tags[i][1];
            }
        }
        return undefined;
    }, [tags]);

    useEffect(() => {
        if (!parentEvent) {
            const parentId = getParentEventId(tags);
            setParentEvent(parentId || rootEvent.id);
        }

        return;
    }, [parentEvent, tags, rootEvent]);

    return (
        <div className="p-2 mx-auto">
            <div className={`flex items-top justify-between ${parentEvent !== rootEvent.id ? 'ml-14 sm:ml-20' : ''}`}>
                <figure className="w-12 sm:w-16 avatar mr-4 flex-basis" style={{flexGrow: 0, flexShrink: 0}}>
                    {author && author.picture
                        ? <img className="object-cover rounded-full w-12  h-12 sm:w-16 sm:h-16 ring ring-2 ring-black" src={author.picture} style={{backgroundColor: `#${pubkey.substr(0,6)}`, lineHeight: 0}} />
                        : <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 ring ring-2 ring-black rounded-full uppercase text-black" style={{backgroundColor: `#${pubkey.substr(0,6)}`, lineHeight: 0, verticalAlign: 'center'}}><span className="text-3xl">{pubkey.substr(0,2)}</span></div>
                    }
                </figure>
                <div className="flex-grow flex-shrink overflow-hidden">
                    <div className="flex items-top justify-between">
                        <div className="flex-shrink flex-grow overflow-hidden">
                            <a href={`nostr:p:${pubkey}`} title={pubkey} className="text-lg block truncate">
                                {parentEvent !== rootEvent.id ? <ArrowUturnDownIcon className="inline w-4 h-4 -mt-1 mr-1 rotate-180" /> : ''}
                                <b>{ author.display_name || author.name || pubkey }</b>
                                { author.nip05 
                                    ? <abbr title={author.nip05.replace('_@', '@')}><CheckBadgeIcon color="purple" className="-mt-1 mx-1 w-4 h-4 inline-block" /></abbr>
                                    : <abbr className="opacity-70" title={`Rando ${pubkey}`}><ShieldExclamationIcon className="-mt-1 mx-1 w-4 h-4 inline-block" /></abbr>
                                }
                            </a>
                            <a href={`nostr:e:${id}`} title={id} className="text-xs block whitespace-nowrap truncate opacity-70">
                                <time dateTime={createdDate.toISOString()}><ClockIcon className="w-3 h-3 inline" /> {formatDate(createdDate)}</time>
                            </a>
                        </div>
                        <div className="flex-basis ml-2 text-right">
                            <MinusIcon className="w-6 h-6 hidden inline-block" />
                            <EllipsisHorizontalIcon className="w-6 h-6 inline-block" />
                        </div>
                    </div>
                    <div className="mt-2 text-md">
                        <p>{content}</p>
                    </div>
                    <div className="mt-2 text-md hidden">
                        <button className="mr-2"><HandThumbUpIcon className="-mt-1 mr-1 w-5 h-5 inline-block" /><span>0</span></button>
                        <button className="mr-2"><HandThumbDownIcon className="-mt-1 mr-1 w-5 h-5  inline-block" /><span>0</span></button>
                        <span className="mx-2 hidden">&middot;</span>
                        <button className="mr-2 hidden">Reply</button>
                    </div>
                    <hr className="mt-2 mb-4" />
                </div>
            </div>
        </div>
    );
}

export default memo(Comment);