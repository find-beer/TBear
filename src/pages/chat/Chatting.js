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
  ActivityIndicator,
} from 'react-native'
import { NimSession, NimFriend } from 'react-native-netease-im'
// import { ChatInput, MessageList } from 'react-native-imui'
import React from 'react'
import {
  GiftedChat,
  Bubble,
  Send,
  IMessage,
  Actions,
  renderActions,
} from 'react-native-gifted-chat'
import { screenW } from '../../constants'
import { connect, bindActions, bindState } from './../../redux'
import { GetRequest } from '../../utils/request'
import { getDayTime } from '../../utils/date'
import { scaleSize, scaleFont } from '../../utils/scaleUtil'
import { setStorage, getStorage, removeStorage } from '../../utils/storage'
const SDK = require('../../../nim/NIM_Web_SDK_rn_v7.2.0.js')
import md5 from '../../utils/md5'
import { TouchableOpacity } from 'react-native-gesture-handler'
import Item from '@ant-design/react-native/lib/list/ListItem'
import ImagePicker from 'react-native-image-picker'
import AsyncStorage from '@react-native-community/async-storage'
const data = {}
const images = {
  uploadpictures: require('../../assets/chat/uploadpictures.png'),
  sendvoice: require('../../assets/chat/sendvoice.png'),
  sendmood: require('../../assets/chat/sendmood.png'),
  addmore: require('../../assets/chat/addmore.png'),
}
let imagesArr = []
class Chatting extends React.Component {
  constructor(props) {
    super(props)
    console.log('propsChating', this.props)
    console.log('ChatingUid', Number(this.props.route.params.uid))
    this.state = {
      userInfo: this.props.userInfo,
      messages: [],
      frinedInfo: {}, // 好友的信息
      friendUid: this.props.route.params.uid,
      isLoadingEarlier: false,
      token: null,
      images: [],
    }
  }

  componentDidMount() {
    console.log('componentDidMount')
    // 获取token
    AsyncStorage.getItem('session', (error, result) => {
      this.setState({ token: result })
    })
    this.fetchFrinedInfo()
    this.initChat()

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
    Alert.alert(options['message'])
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

  // getHistoryMsgs = () => {
  //   this.instance.getLocalMsgs({
  //     sessionId: 'p2p-' + this.state.friendUid,
  //     limit: 100,
  //     done: this.getLocalMsgsDone,
  //   })
  // }
  // getLocalMsgsDone = (error, obj) => {
  //   console.log('获取本地消息' + (!error ? '成功' : '失败'), error, obj)
  // }

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
          <TouchableOpacity style={styles.registerBtnBox}>
            <Text style={styles.registerBtnText}>发送</Text>
          </TouchableOpacity>
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
  renderInputToolbar = (props) => {
    return <InputToolbar {...props} containerStyle={styles.inputToolbar} />
  }

  choosePicture = () => {
    const { images, token } = this.state
    const options = {
      title: '选择',
      cancelButtonTitle: '取消',
      takePhotoButtonTitle: '拍照',
      chooseFromLibraryButtonTitle: '媒体库',
      cameraType: 'back',
      mediaType: 'photo',
      videoQuality: 'low',
      durationLimit: 10,
      maxWidth: 600,
      maxHeight: 600,
      aspectX: 2,
      aspectY: 1,
      quality: 0.5,
      angle: 0,
      allowsEditing: false,
      noData: false,
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    }

    let currentHeader
    if (Platform.OS === 'ios') {
      currentHeader = {
        'Content-Type': 'multipart/form-data;charset=utf-8',
        token,
      }
    } else {
      currentHeader = {
        Accept: 'application/json',
        token,
      }
    }

    ImagePicker.showImagePicker(options, (response) => {
      console.log('Response', response)
      // this.props.setModalLoading(true, '上传中')
      // let formData = new FormData()
      // formData.append('imgFile', {
      //   uri:
      //     Platform.OS === 'ios'
      //       ? 'data:image/jpeg;base64,' + response.data
      //       : response.uri,
      //   type: 'multipart/form-data',
      //   name: 'trend' + new Date().getTime() + '.jpg',
      // })
      // fetch(apiProd.host + 'common/uploadImage', {
      //   method: 'POST',
      //   headers: currentHeader,
      //   body: formData,
      // })
      //   .then((response) => {
      //     return response.json()
      //   })
      //   .then((res) => {
      //     imagesArr.push(res.data.url)
      //     this.setState(
      //       {
      //         images: imagesArr,
      //       },
      //       () => {
      //         this.props.setModalLoading(false)
      //         // console.log('images', this.state.images)
      //       }
      //     )
      //   })
      //   .catch((e) => {
      //     this.props.setModalLoading(false)
      //     Toast.toast('上传失败，请重试')
      //   })
    })
  }

  uploadpictures = () => {
    console.log('上传图片')
    this.choosePicture()
  }
  sendvoice = () => {
    console.log('发送语音')
  }
  sendmood = () => {
    console.log('发送表情包')
  }
  addmore = () => {
    console.log('添加更多')
  }
  uploadImage = () => {}

  render() {
    const { messages } = this.state
    const { name, headPicUrl, uid } = this.state.userInfo

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
          onSend={(messages) => this.onSend(messages)}
          showUserAvatar={true}
          locale={'zh-cn'}
          placeholder={'开始聊天吧'}
          renderSend={this.renderSend}
          renderBubble={this.renderBubble}
          minInputToolbarHeight={70}
          renderInputToolbar={this.renderInputToolbar}
          user={{
            _id: uid,
            name: name,
            avatar: headPicUrl,
          }}
          // onLoadEarlier={this.onLoadEarlier}
          alwaysShowSend={true}
          renderLoading={() => <ActivityIndicator />}
          isAnimated
          // renderAvatarOnTop
          scrollToBottom={true}
          // alignTop={true}
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
    // width: '100%',
    width: scaleSize(200),
    // height: scaleSize(120),
    height: scaleSize(100),
    borderRadius: scaleSize(80),
    backgroundColor: '#564F5F',
    // marginTop: scaleSize(70),
  },
  registerBtnText: {
    color: '#fff',
    textAlign: 'center',
    lineHeight: scaleSize(100),
    fontSize: 19,
  },
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
