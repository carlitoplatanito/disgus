import { useEffect, useState } from 'react';
import { formatDate } from "../helpers/utils";
import { getUser } from '../helpers/nostr';
import { CheckBadgeIcon } from '@heroicons/react/24/solid'

export default function Comment(props) {
    const { pubkey, content, created_at, relays } = props;
    const [author, setAuthor] = useState(false);
    const createdDate = new Date(created_at * 1000);

    useEffect(() => {
        if (!author || !author.name) {
            getUser(pubkey, relays).then((data) => {
                setAuthor(data);
            });
        }
    }, [author]);

    return (
        <div className="p-2 mx-auto">
            <div className="grid grid-cols-6 gap-2 shadow-bottom">
                <div className="col-span-1 text-center pt-1">
                    <figure className="rounded-full overflow-hidden w-16 h-16 text-center" style={{backgroundColor: `#${pubkey.substr(0,6)}`}}>
                        {author && author.picture
                            ? <img className="rounded-full w-full h-auto" src={author.picture} />
    : <span className="text-xl inline-block">{pubkey.substr(0,2)}</span>}
                    </figure>
                </div>
                <div className="col-span-5">
                    <div className="grid grid-cols-3">
                        <div className="col-span-2 text-left">
                            {author && author.name
                                ? <abbr title={pubkey} className="text-md block truncate">{author.display_name || author.name}{author.nip05 ? <div className="text-gray text-xs"><CheckBadgeIcon width={16} color="gray" className="inline" />{author.nip05}</div> : ''}</abbr>
                                : <span className="text-md text-gray-600 animate-pulse block truncate">{pubkey}</span>
                            }
                        </div>
                        <div className="col-span-1 text-right">
                            <time className="text-md whitespace-nowrap text-gray-600" dateTime={createdDate.toISOString()}>{formatDate(createdDate)}</time>
                        </div>
                    </div>
                    <div className="mt-2">
                        <p>{content}</p>
                    </div>
                    <hr className="mt-2 mb-4" />
                </div>
            </div>
        </div>
    );
}