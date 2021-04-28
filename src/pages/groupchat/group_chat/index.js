import { View, Image, StyleSheet, DeviceEventEmitter } from 'react-native'
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
import Header from '../../../components/header/index'
import { screenW } from '../../../constants'
import { scaleSize, scaleFont } from '../../../utils/scaleUtil'
import { connect, bindActions, bindState } from '../../../redux'
const images = {
  uploadpictures: require('../../../assets/chat/uploadpictures.png'),
  sendvoice: require('../../../assets/chat/sendvoice.png'),
  sendmood: require('../../../assets/chat/sendmood.png'),
  addmore: require('../../../assets/chat/addmore.png'),
}
class GroupChat extends React.Component {
  constructor(props) {
    super(props)
    console.log(
      'GroupChat=============================>',
      props.route.params.activeId
    )
    this.state = {
      id: props.route.params.activeId, //活动Id
      messages: [],
      userInfo: this.props.userInfo,
      activityData: {},
    }
  }

  requireActivityData = async () => {
    const { id } = this.state

    const { success, data } = await this.props.get('activity/activity/detail', {
      id,
    })
    console.log('requireActivityData=============> ', data)
    if (success) {
      this.setState({ activityData: data }, () => {
        console.log('data', this.state.activityData)
      })
    }
  }

  componentDidMount() {
    this.event = DeviceEventEmitter.addListener('fetchOnTeams', (teams) => {
      // 注册通知
      console.log('teams=======================>', teams)
    })
    // 获取活动详情
    this.requireActivityData()
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

  componentWillUnmount() {
    this.event.remove()
  }
  onRightClick = () => {
    console.log('拉人入群')
    const { activityTitle, payGroupId, groupId } = this.state.activityData
    const { navigation } = this.props
    navigation.navigate('ChatSetting', { teamId: payGroupId })
  }
  onSend(messages = []) {
    this.setState((previousState) => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }))
  }

  render() {
    const { messages } = this.state
    const { activityTitle, payGroupId, groupId } = this.state.activityData
    console.log('render================>', this.state.activityData)

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
        <Header
          {...this.props}
          noLeft
          title={activityTitle}
          right={'。。。'}
          onRightClick={this.onRightClick}
        />
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

export default connect(bindState, bindActions)(GroupChat)

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
