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
                    return comments
                      .filter((value, index, self) =>
                        
                        index === self.findIndex((t) => (
                          t.id === value.id
                        ))
                      )
                      .sort((a, b) => b.created_at - a.created_at)
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
