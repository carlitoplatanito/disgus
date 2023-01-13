import { useEffect, useState } from 'react'
import { getChannels, getChannel, getComments, postComment } from './helpers/nostr';
import Comment from './components/Comment';
import CommentForm from './components/CommentForm'
import UserForm from './components/UserForm'

function App({ config }) {
  const { admin, title, canonical, relay, channel: defaultChannel = '', nos2x } = config;
  const [ channel, setChannel ] = useState(false);
  const [ user, setUser ] = useState(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : false);
  const [ comments, setComments ] = useState([]);
  
  useEffect(() => {
    if (!channel && localStorage.getItem(canonical)) {
      setChannel(JSON.parse(localStorage.getItem(canonical)));
    } else if (!channel && !defaultChannel) {
      getChannels(admin, relay).then((channels) => {
        channels.forEach((c) => {
          const cdata = JSON.parse(c.content);

          if (cdata.about === canonical) {
            localStorage.setItem(canonical, JSON.stringify({
              id: c.id,
              ...cdata
            }));
            setChannel({
              id: c.id,
              ...cdata
            });
          }
        });
      });
    } else if (!channel && defaultChannel) {
      getChannel(defaultChannel, relay).then((c) => {
        const cdata = JSON.parse(c.content);

        if (cdata.about === canonical) {
          setChannel({
            id: c.id,
            ...cdata
          });
        }
      });
    }
    
    if (channel) {
      getComments(channel.id, relay).then((cs) => {
        setComments(cs);
      });
    }

  }, [channel, defaultChannel, comments, admin]);

  return (
    <div className="relative overflow-hidden bg-white my-2 px-6 py-3 shadow-md sm:mx-auto sm:max-w-lg sm:rounded-lg">
      <div className="border-bottom">
        <CommentForm config={config} user={user} onSetChannel={setChannel} channel={channel} />
        <UserForm config={config} user={user} onSetUser={setUser} />
      </div>
      <div>
      {channel ?
        comments.sort((a, b) => b.created_at - a.created_at).map((comment, i) => {
          return <Comment key={i} {...comment} />
        })
      : ''}
      </div>
    </div>
  )
}

export default App
