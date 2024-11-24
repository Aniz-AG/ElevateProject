import React, { useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import api from '../api/api';
import { DataContext } from '../Context/DataContext';

const ChatSection = () => {
  const [chatHistories, setChatHistories] = useState([]); //stores the chat content for a specific chat
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser,setSelectedUser ] = useState(null);
  const [users, setUsers] = useState([]); //this is for all users
  const [chats, setChats] = useState([]); //this is for the list of people I chat with
  const [chatId,setChatId]=useState('');
  const {userInfo} = useContext(DataContext);
  console.log("Userinfo:",userInfo);
  const socket = io('http://localhost:8000');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users/getAllUsers');
        console.log("Response of fetch all users", response.data);
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    const fetchChats = async () => {
      try {
        const response = await api.get('/users/chat/fetchChat');
        console.log("All chats:", response.data);
        setChats(response.data);
      } catch (error) {
        console.error('Failed to fetch chats:', error);
      }
    };

    fetchUsers();
    fetchChats();
  }, []);

  // useEffect(() => {
  //   socket.on('receive-message', (message) => {
  //     setChatHistories((prevHistories) => {
  //       const userId = message.userId;
  //       return {
  //         ...prevHistories,
  //         [userId]: [...(prevHistories[userId] || []), message],
  //       };
  //     });
  //   });

  //   return () => {
  //     socket.off('receive-message');
  //   };
  // }, []);
//Sending message
  const handleSendMessage = async() => {
    try{
      if (!newMessage.trim() || !selectedUser ) return;
      else
      {
        console.log("Chat id in send message:",chatId);
        console.log("Content of send message:",newMessage);
          const res= await api.post('./users/chat/message/send',{chatId,content:newMessage});
          console.log("Res in chat:",res);
          setNewMessage('');
          fetchMessages(chatId);
      }
      }catch(err)
      {
        console.log("Error sending message",err);
      }
    // const message = {
    //   sender: userInfo.id, // Use userInfo.id for sender
    //   content: newMessage,
    //   time: new Date().toLocaleTimeString(),
    //   userId: selectedUser ._id,
    // };

    // socket.emit('send-message', message);

    // setChatHistories((prevHistories) => ({
    //   ...prevHistories,
    //   [selectedUser ._id]: [...(prevHistories[selectedUser ._id] || []), message],
    // }));
    // setNewMessage('');
  };

  //for the start chat in the rightmost section
  const handleChatNow = async (friendId) => {
    try {
      const response = await api.post('/users/chat/createChat', { friendId });
      const newChat = response.data;
      setChats((prevChats) => [...prevChats, newChat]);
      //setSelectedUser (users.find(user => user._id === friendId)); // Set the selected user
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  //To show chats of the particular friend
  const fetchMessages = async (chatID) => {
    try {
      const response = await api.get(`/users/chat/messages/${chatID}`);
      console.log("Response in fetch messages:",response.data);
      console.log("Chat Id:",chatID);
      //const messageContents = response.data.map(message => message.content);
      setChatHistories(response.data);
      console.log("Chat History:",chatHistories);
      // setChatHistories((prevHistories) => ({
      //   ...prevHistories,
      //   [selectedUser._id]: response.data,
      // }));
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };
//as soon as I click on a chat
  const handleUserClick = (chat) => {
    setChatId(chat?._id);
    console.log("UserId:",userInfo.id);
    console.log("Chat in userClick:",chat);
    // Find the other user in the chat
    const otherUser  = chat.persons.find(person => person._id !== userInfo.id);
    if (otherUser) {
      setSelectedUser(otherUser);
      if(selectedUser)
      {
        fetchMessages(chat?._id); // Fetch messages for this chat
      }
    }
  };

  return (
    <div className="flex gap-[100px] h-screen p-4 bg-black text-white pb-[200px]">
      {/* Chat Section with fetched users */}
      <div className="flex w-4/5 h-full bg-gray-800 text-white border border-gray-600 rounded-lg shadow-lg">
        {/* User list on the left */}
        <div className="flex flex-col w-1/4 h-full bg-gray-900 p-4 border-r border-gray-600">
          < h2 className="text-lg font-semibold mb-4">Friends</h2>
          <div className="overflow-y-auto flex-1 space-y-2">
            {chats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => handleUserClick(chat)}
                className={`flex items-center p-2 cursor-pointer rounded-lg ${
                  selectedUser  && selectedUser._id === chat.persons.find(p => p._id !== userInfo.id)._id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'
                }`}
              >
                <img src={`http://localhost:8000/${chat.persons[1].profilePhoto}`} alt={chat.persons[1].name} className="w-10 h-10 rounded-full mr-3" />
                <p className="font-semibold">{chat.persons[1].name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chat area on the right */}
        <div className="flex flex-col w-3/4 h-full p-4">
          {selectedUser  && (
            <>
              <h2 className="text-lg font-semibold mb-2">Chatting with: {selectedUser.name}</h2>              
              {/* Messages display */}
              <div className="flex-1 overflow-y-auto space-y-3 border-b border-gray-600 pb-4">
                {chatHistories.length > 0 ? (
                  chatHistories.map((message,index) => (
                    <div
                      key={index}
                      className={`flex items-center ${message.sender === userInfo.id ? 'justify-end' : ''}`}
                    >
                      {message.sender !== userInfo.id && (
                        <img
                          src={selectedUser .profilePhoto}
                          alt="User Avatar"
                          className="w-8 h-8 rounded-full mr-2"
                        />
                      )}
                      <div
                        className={`p-2 rounded-lg max-w-xs ${
                          message.sender === userInfo.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        <p>{message.content}</p>
                        <span className="text-xs text-gray-500">{message.time}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center">Start Messaging Now</p>
                )}
              </div>

              {/* Chat input area */}
              <div className="mt-4 flex items-center">
                <input
                  type="text"
                  placeholder="Type a message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-grow border border-gray-600 rounded-lg p-2 mr-2 bg-gray-900 text-white"
                />
                <button onClick={handleSendMessage} className="p-2 bg-blue-500 text-white rounded-lg">
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Scrollable All Users Section */}
      <div className="w-1/5 h-[80vh] bg-gray-100 text-gray-900 border border-gray-300 rounded-lg shadow-lg ml-4 p-4 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Find and Connect</h2>
        {users.map((user) => {
            const expertiseArray = JSON.parse(user.expertise[0] || '[]');
            const profilePhotoUrl = `http://localhost:8000/${user.profilePhoto}`;
            return (
              <div
                key={user._id}
                className="flex flex-col items-start p-3 border border-gray-200 bg-white rounded-lg shadow-md mb-4 hover:shadow-lg transition-shadow"
              >
                {/* Profile Image and Name */}
                <div className="flex items-center mb-2 w-full border-b pb-2 border-gray-200">
                  <img
                    src={profilePhotoUrl || "https://via.placeholder.com/50"}
                    alt={user.name}
                    className="w-10 h-10 rounded-full mr-3 border border-gray-300 shadow-sm"
                  />
                  <p className="text-lg font-semibold capitalize text-gray-800">{user.name}</p>
                </div>

                {/* Details Section */}
                <div className="text-sm text-gray-700 leading-relaxed w-full mt-2 space-y-1">
                  <div className="flex flex-wrap gap-2 mt-2">
                    {expertiseArray.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 rounded-md text-xs font-semibold bg-blue-500 text-white shadow-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-600 mt-2 font-bold">{user.organisation}</p>
                  <p className="italic text-gray-500 font-bold">"{user.description || 'No description available'}"</p>
                </div>

                {/* Button */}
                <button
                  onClick={() => handleChatNow(user._id)}
                  className="mt-3 w-full py-1 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 transition-colors"
                >
                  Chat Now
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default ChatSection;