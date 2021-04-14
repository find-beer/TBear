/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react'
import {
  NativeAppEventEmitter,
  StyleSheet,
  View,
  SafeAreaView,
  Text,
} from 'react-native'
import { NimSession, NimFriend } from 'react-native-netease-im'
// import { ChatInput, MessageList } from 'react-native-imui'
import { screenW } from '../../constants'
import { connect, bindActions, bindState } from './../../redux'
const SDK = require('../../../nim/NIM_Web_SDK_rn_v7.2.0.js')
import md5 from '../../utils/md5'
class Chatting extends React.Component {
  constructor(props) {
    super(props)
    console.log('propsChating', props)
    console.log('ChatingUid', Number(this.props.route.params.uid))
    this.state = {
      messages: [],
    }
  }

  componentDidMount() {
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
  }
  onConnect = (options) => {
    console.log('onConnect', options)
    // this.instance.applyFriend({
    //   account: 'mjx',
    //   ps: 'sdjfsjdfsjdf',
    //   done: this.applyFriendDone,
    // })
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
    console.log('onRoamingMsgs', options)
  }

  onOfflineMsgs = (options) => {
    console.log('onOfflineMsgs', options)
  }

  onMsg = (msg) => {
    console.log('onMsg', options)
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

  // applyFriendDone = (error, options) => {}

  render() {
    const { messages } = this.state
    return (
      <View>
        <Text>聊天界面</Text>
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
      </View>
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
})
