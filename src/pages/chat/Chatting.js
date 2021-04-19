/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import {
  NativeAppEventEmitter,
  StyleSheet,
  View,
  SafeAreaView,
  Text,
  Image,
  Alert,
  Button,
} from 'react-native'
import { NimSession, NimFriend } from 'react-native-netease-im'
// import { ChatInput, MessageList } from 'react-native-imui'
import React from 'react'
import { GiftedChat, Bubble, Send, IMessage } from 'react-native-gifted-chat'
import { screenW } from '../../constants'
import { connect, bindActions, bindState } from './../../redux'
import { GetRequest } from '../../utils/request'
import { getDayTime } from '../../utils/date'
import { scaleSize, scaleFont } from '../../utils/scaleUtil'
import { setStorage, getStorage, removeStorage } from '../../utils/storage'
const SDK = require('../../../nim/NIM_Web_SDK_rn_v7.2.0.js')
import md5 from '../../utils/md5'
const data = {}
class Chatting extends React.Component {
  constructor(props) {
    super(props)
    // console.log('propsChating', this.props.userInfo)
    // console.log('ChatingUid', Number(this.props.route.params.uid))
    this.state = {
      userInfo: this.props.userInfo,
      messages: [],
      frinedInfo: {}, // 好友的信息
      friendUid: this.props.route.params.uid,
    }
  }

  componentDidMount() {
    console.log('componentDidMount')
    this.fetchFrinedInfo()
    this.initChat()

    // NimSession.startSession('wzy', '2')
    // NimSession.getRecentContactList().then(
    //   (data) => {
    //     console.log('聊天内容：', data)
    //   },
    //   (err) => {
    //     console.log('聊天err：', err)
    //   }
    // )
    // NativeAppEventEmitter.addListener('observeReceiveMessage', (data) => {
    //   console.log('observeReceiveMessage', data)
    // })
    // const res = NimSession.sendTextMessage(
    //   '你好，我是一条来自魏志扬发送的消息，请注意查收哦',
    //   ['mjx']
    // )
    getStorage('messages').then((res) => {
      // console.log('============messages=============', res)
      if (res) {
        this.setState(
          {
            messages: eval(res),
          },
          () => {
            // console.log('messagesStorage', this.state.messages)
          }
        )
      }
    })

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
        // {
        //   _id: 1,
        //   text: 'Hello developer',
        //   createdAt: new Date(Date.UTC(2016, 7, 30, 17, 20, 0)),
        //   user: {
        //     _id: 102,
        //     name: 'React Native',
        //     avatar: 'https://facebook.github.io/react/img/logo_og.png',
        //   },
        // },
      ],
    })
  }

  // 获取好友信息
  fetchFrinedInfo = () => {
    GetRequest('user/userInfo', {
      userId: Number(this.state.friendUid),
    }).then((res) => {
      // console.log('personalInfo', res) //true
      this.setState(
        {
          frinedInfo: res.data,
        },
        () => {
          // console.log('frinedInfo', this.state.frinedInfo)
        }
      )
    })
  }

  // 发送信息
  onSend(newMessages = []) {
    console.log('newMessages', newMessages)
    // 发送信息
    this.instance.sendText({
      scene: 'p2p',
      to: this.state.frinedInfo.uid,
      text: newMessages[0].text,
      done: (error, msg) => {
        if (!error) {
          this.pushMsg(msg)
        }
      },
    })
  }

  onConnect = (options) => {
    this.getHistoryMsgs()
    console.log('onConnect', options)
  }

  onWillReconnect = (options) => {
    console.log('onWillReconnect', options)
  }

  onDisconnect = (options) => {
    console.log('onDisconnect', options)
  }

  onError = (options) => {
    console.log('onError', options)
  }

  onRoamingMsgs = (options) => {
    this.pushMsg(options.msgs)
    console.log('onRoamingMsgs', options)
  }

  onOfflineMsgs = (options) => {
    this.pushMsg(options.msgs)
    console.log('onOfflineMsgs', options)
  }

  onMsg = (options) => {
    this.pushMsg(options)
  }

  getHistoryMsgs = () => {
    this.instance.getLocalMsgs({
      sessionId: 'p2p-' + this.state.friendUid,
      limit: 100,
      done: this.getLocalMsgsDone,
    })
  }
  getLocalMsgsDone = (error, obj) => {
    console.log('获取本地消息' + (!error ? '成功' : '失败'), error, obj)
  }

  pushMsg = (msgs) => {
    if (!Array.isArray(msgs)) {
      msgs = [msgs]
    }
    var sessionId = msgs[0].sessionId
    data.msgs = data.msgs || {}
    data.msgs[sessionId] = this.instance.mergeMsgs(data.msgs[sessionId], msgs)

    // 发送信息
    let newMessages = []
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (Number(msgs[i].from) === this.state.userInfo.uid) {
        const { name, headPicUrl, uid } = this.state.userInfo
        newMessages.push({
          createdAt: getDayTime(msgs[i].time),
          text: msgs[i].text,
          user: {
            _id: uid,
            name: name,
            avatar: headPicUrl,
          },
          _id: Math.round(Math.random() * 1000000),
        })
      } else {
        // 接收信息
        const { uid, name, headPicUrl } = this.state.frinedInfo
        newMessages.push({
          createdAt: getDayTime(msgs[i].time),
          text: msgs[i].text,
          user: {
            _id: uid,
            name: name,
            avatar: headPicUrl,
          },
          _id: Math.round(Math.random() * 1000000),
        })
      }
    }

    // 更新信息
    this.setState(
      (previousState) => {
        console.log('previousState', previousState)
        return {
          messages: GiftedChat.append(previousState.messages, newMessages),
        }
      },
      () => {
        console.log('messages2', this.state.messages)
        setStorage('messages', JSON.stringify(this.state.messages))
      }
    )
  }

  initChat = () => {
    const { iminfo } = this.props.userInfo
    const { accid, token } = iminfo
    this.instance = SDK.NIM.getInstance({
      debug: true,
      appKey: '67b35e65c41efd1097ef8504d5a88455',
      token,
      account: accid,
      db: false, // 不使用数据库
      onconnect: this.onConnect,
      onwillreconnect: this.onWillReconnect,
      ondisconnect: this.onDisconnect,
      onerror: this.onError,
      onroamingmsgs: this.onRoamingMsgs,
      onofflinemsgs: this.onOfflineMsgs,
      onmsg: this.onMsg,
    })
  }

  renderSend = (props) => {
    return (
      <Send {...props}>
        <View>
          <Button style={styles.registerBtnBox}>
            <Text style={styles.registerBtnText}>发送</Text>
          </Button>
        </View>
      </Send>
    )
  }

  renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        textStyle={{
          right: {
            color: '#ffffff',
          },
        }}
        wrapperStyle={{
          right: {
            backgroundColor: '#564F5F',
          },
        }}
      />
    )
  }

  render() {
    const { messages } = this.state
    const { name, headPicUrl, uid } = this.state.userInfo
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
          onSend={(messages) => this.onSend(messages)}
          showUserAvatar={true}
          locale={'zh-cn'}
          placeholder={'开始聊天吧'}
          renderSend={this.renderSend}
          renderBubble={this.renderBubble}
          user={{
            _id: uid,
            name: name,
            avatar: headPicUrl,
          }}
        />

        {/* <MessageList
          style={styles.messageList}
          initalData={messages}
          avatarSize={{ width: 40, height: 40 }}
          sendBubbleTextSize={18}
          sendBubbleTextColor="000000"
        />
        <SafeAreaView forceInset={{ top: false }}>
          <ChatInput
            style={{
              width: window.width,
              height: 50,
            }}
            menuViewH={220}
            defaultToolHeight={50}
          ></ChatInput>
        </SafeAreaView> */}
      </>
    )
  }
}

export default connect(bindState, bindActions)(Chatting)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  messageList: {
    // backgroundColor: 'red',
    flex: 1,
    marginTop: 0,
    width: window.width,
    margin: 0,
  },
  inputView: {
    backgroundColor: 'green',
    width: window.width,
    height: 100,
  },
  btnStyle: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#3e83d7',
    borderRadius: 8,
    backgroundColor: '#3e83d7',
  },
  iconRow: {
    flexDirection: 'row',
    paddingHorizontal: screenW / 5 - 1,
    flexWrap: 'wrap',
    paddingVertical: 30,
  },
  actionCol: {
    alignItems: 'center',
    marginRight: screenW / 5,
    height: 95,
  },
  iconTouch: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerBtnBox: {
    width: '100%',
    height: scaleSize(120),
    borderRadius: scaleSize(40),
    backgroundColor: '#8A8DF9',
    marginTop: scaleSize(70),
  },
  registerBtnText: {
    color: '#fff',
  },
})
