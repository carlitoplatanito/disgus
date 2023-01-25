import { useEffect, useState } from 'react';
// import { createRootEvent, getComments, getRootEvent, getUser } from './helpers/nostr';
import Comment from './components/Comment';
import CommentForm from './components/CommentForm';
import UserForm from './components/UserForm';
import { UserProvider } from './context/user';
import { RootProvider, RootConsumer } from './context/root';

function App({ config }) {
  return (
    <RootProvider config={config}>
      <UserProvider>
        <div className="relative text-left overflow-hidden mx-auto px-2 sm:px-4">
            <UserForm />
            <CommentForm />
            <div>
              <RootConsumer>
                {({ comments }) => {
                  if (comments && comments.length > 0) {
                    const _times = {};

                    return comments
                      .filter((value, index, self) => {
                          _times[value.id] = value.created_at;
                  
                          return index === self.findIndex((t) => (
                            t.id === value.id
                          ));
                        }
                      )
                      .sort((a, b) => {
                        const eventTags = a.tags.filter((t) => t[0] === 'e').map((t) => t[1]);

                        if (eventTags.length > 1) {
                          const parentId = eventTags[eventTags.length -1];
                  
                          return b.created_at - (_times[parentId] - 1);
                        }
                        
                        return b.created_at - a.created_at;
                      })
                      .map((comment, i) => <Comment key={i} comment={comment} />);
                  }

                  return <></>;
                }}
              </RootConsumer>
            </div>
          </div>
      </UserProvider>
    </RootProvider>
  )
}

export default App
