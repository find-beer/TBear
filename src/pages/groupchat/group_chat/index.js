import { View, Image, StyleSheet } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import React from 'react'
import {
  GiftedChat,
  Bubble,
  Send,
  IMessage,
  Actions,
  renderActions,
} from 'react-native-gifted-chat'
import { screenW } from '../../../constants'
import { scaleSize, scaleFont } from '../../../utils/scaleUtil'
const images = {
  uploadpictures: require('../../../assets/chat/uploadpictures.png'),
  sendvoice: require('../../../assets/chat/sendvoice.png'),
  sendmood: require('../../../assets/chat/sendmood.png'),
  addmore: require('../../../assets/chat/addmore.png'),
}
export default class GroupChat extends React.Component {
  constructor(props) {
    super(props)
    console.log(
      'GroupChat=============================>',
      props.route.params.groupId
    )
    this.state = {
      groupId: props.route.params.groupId, //群Id
      messages: [],
    }
  }

  componentDidMount() {
    if (!this.state.messages.length) {
      this.setState({
        messages: [
          {
            _id: Math.round(Math.random() * 1000000),
            text: '0 message',
            createdAt: new Date(),
            system: true,
          },
        ],
      })
    }
    this.setState({
      messages: [
        {
          _id: Math.round(Math.random() * 1000000),
          text: '#awesome',
          createdAt: new Date(),
          user: {
            _id: 1,
            name: 'Developer',
          },
        },
        {
          _id: Math.round(Math.random() * 1000000),
          text: '',
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'React Native',
          },
          image:
            'http://www.pokerpost.fr/wp-content/uploads/2017/12/iStock-604371970-1.jpg',
          sent: true,
          received: true,
        },
        {
          _id: Math.round(Math.random() * 1000000),
          text: 'Send me a picture!',
          createdAt: new Date(),
          user: {
            _id: 1,
            name: 'Developer',
          },
        },
        {
          _id: Math.round(Math.random() * 1000000),
          text: '',
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'React Native',
          },
          sent: true,
          received: true,
          location: {
            latitude: 48.864601,
            longitude: 2.398704,
          },
        },
        {
          _id: Math.round(Math.random() * 1000000),
          text: 'Where are you?',
          createdAt: new Date(),
          user: {
            _id: 1,
            name: 'Developer',
          },
        },
        {
          _id: Math.round(Math.random() * 1000000),
          text: 'Yes, and I use Gifted Chat!',
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'React Native',
          },
          sent: true,
          received: true,
        },
        {
          _id: Math.round(Math.random() * 1000000),
          text: 'Are you building a chat app?',
          createdAt: new Date(),
          user: {
            _id: 1,
            name: 'Developer',
          },
        },
        {
          _id: Math.round(Math.random() * 1000000),
          text: 'You are officially rocking GiftedChat.',
          createdAt: new Date(),
          system: true,
        },
      ],
    })
  }

  onSend(messages = []) {
    this.setState((previousState) => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }))
  }

  render() {
    const { messages } = this.state

    const list = [
      {
        icon: images.uploadpictures,
        handler: 'uploadpictures',
      },
      {
        icon: images.sendvoice,
        handler: 'sendvoice',
      },
      {
        icon: images.sendmood,
        handler: 'sendmood',
      },
      {
        icon: images.addmore,
        handler: 'addmore',
      },
    ]
    return (
      <>
        {this.state.messages.length === 0 && (
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: 'white',
                justifyContent: 'center',
                alignItems: 'center',
                bottom: 50,
              },
            ]}
          >
            <Image
              source={{ uri: 'https://i.stack.imgur.com/qLdPt.png' }}
              style={{
                ...StyleSheet.absoluteFillObject,
                resizeMode: 'contain',
              }}
            />
          </View>
        )}
        <GiftedChat
          messages={messages}
          onSend={(messages) => {
            this.onSend(messages)
          }}
          showUserAvatar={true}
          locale={'zh-cn'}
          placeholder={'开始聊天吧'}
          user={{
            _id: -1,
            // name: name,
            // avatar: headPicUrl,
          }}
        />

        <View style={styles.sendWrap}>
          {list.map((item, index) => {
            return (
              <TouchableOpacity
                key={index + 'icon'}
                onPress={() => this[item.handler]()}
              >
                <Image source={item.icon} style={styles.icon} />
              </TouchableOpacity>
            )
          })}
        </View>
      </>
    )
  }
}

const styles = StyleSheet.create({
  sendWrap: {
    // height: 45,
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: scaleSize(30),
  },
  icon: {
    width: scaleSize(64),
    height: scaleSize(64),
    // marginRight: scaleSize(200),
  },
  uploadImage: {
    width: scaleSize(64),
    height: scaleSize(64),
  },
  inputToolbar: {
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: 'grey',
    borderRadius: 25,
  },
})
