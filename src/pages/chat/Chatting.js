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
  DeviceEventEmitter,
} from 'react-native'
import React from 'react'
import { GiftedChat, Bubble, Send } from 'react-native-gifted-chat'
import { screenW } from '../../constants'
import { connect, bindActions, bindState } from './../../redux'
import { GetRequest } from '../../utils/request'
import { getDayTime } from '../../utils/date'
import { scaleSize, scaleFont } from '../../utils/scaleUtil'
import { setStorage, getStorage, removeStorage } from '../../utils/storage'
const SDK = require('../../../nim/NIM_Web_SDK_rn_v7.2.0.js')
import { TouchableOpacity } from 'react-native-gesture-handler'
import Item from '@ant-design/react-native/lib/list/ListItem'
import ImagePicker from 'react-native-image-picker'
import AsyncStorage from '@react-native-community/async-storage'
import RNFS from 'react-native-fs'
import * as nim from '../../utils/nim'
import { result } from 'lodash'
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
    console.log('instance================>', nim.instance)
    this.fetchFrinedInfo()
    this.fetchMessages()
    this.event = DeviceEventEmitter.addListener('fetchMessages', (msg) => {
      //注册通知
      console.log('DeviceEventEmitter==========================', msg)
      // 接收信息
      const { uid, name, headPicUrl } = this.state.frinedInfo
      let acceptMessage = []
      acceptMessage.push({
        createdAt: getDayTime(msg.time),
        text: msg.text,
        user: {
          _id: uid,
          name: name,
          avatar: headPicUrl,
        },
        _id: Math.round(Math.random() * 1000000),
      })
      // 更新UI信息
      this.handleUpdateMessages(acceptMessage)
    })

    //   if (!this.state.messages.length) {
    //     this.setState({
    //       messages: [
    //         {
    //           _id: Math.round(Math.random() * 1000000),
    //           text: '0 message',
    //           createdAt: new Date(),
    //           system: true,
    //         },
    //       ],
    //     })
    //   }
    //   this.setState({
    //     messages: [
    //       {
    //         _id: 1,
    //         text: 'Hello developer',
    //         createdAt: new Date(Date.UTC(2016, 7, 30, 17, 20, 0)),
    //         user: {
    //           _id: 102,
    //           name: 'React Native',
    //           avatar: 'https://facebook.github.io/react/img/logo_og.png',
    //         },
    //       },
    //     ],
    //   })
  }
  componentWillUnmount() {
    // 移除通知
    this.event.remove()
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

  // 获取漫游信息
  fetchMessages() {
    const roamingMsgs = nim.nimDB.msgs
    let messagesTypes = {}
    if (roamingMsgs !== null || roamingMsgs !== undefined) {
      messagesTypes = Object.values(roamingMsgs)
    }

    // 1) 合并数组
    let messages = []
    for (var i = 0; i < messagesTypes.length; i++) {
      messages.push(...messagesTypes[i])
    }

    // 2）时间排序
    messages.sort((a, b) => {
      return b.time < a.time ? 1 : -1
    })

    // 3）展示聊天数据
    let newMessages = []
    for (let i = messages.length - 1; i >= 0; i--) {
      if (Number(messages[i].from) === this.state.userInfo.uid) {
        // 发送信息
        const { name, headPicUrl, uid } = this.state.userInfo
        newMessages.push({
          createdAt: getDayTime(messages[i].time),
          text: messages[i].text,
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
          createdAt: getDayTime(messages[i].time),
          text: messages[i].text,
          user: {
            _id: uid,
            name: name,
            avatar: headPicUrl,
          },
          _id: Math.round(Math.random() * 1000000),
        })
      }
    }

    // 4）更新UI信息
    this.handleUpdateMessages(newMessages)
  }

  handleUpdateMessages = (newMessages) => {
    this.setState(
      (previousState) => {
        console.log('previousState', previousState)
        return {
          messages: GiftedChat.append(previousState.messages, newMessages),
        }
      },
      () => {
        console.log('messages2', this.state.messages)
      }
    )
  }

  // 发送文本信息
  onSend = (newMessages = []) => {
    console.log('newMessages', newMessages)
    // 发送nim信息
    nim.sendMessage(this.state.frinedInfo.uid, newMessages[0].text)
    // 发送UI信息
    const { name, headPicUrl, uid } = this.state.userInfo
    let sendMessage = []
    sendMessage.push({
      createdAt: getDayTime(new Date()),
      text: newMessages[0].text,
      user: {
        _id: uid,
        name: name,
        avatar: headPicUrl,
      },
      _id: Math.round(Math.random() * 1000000),
    })
    // 更新UI信息
    this.handleUpdateMessages(sendMessage)
  }

  // 根据文件类型发送
  onSendByType = (data) => {
    // 发送图片UI展示
    const { name, headPicUrl, uid } = this.state.userInfo
    const newImageMessages = []
    const dataURL = 'data:image/jpeg;base64,' + data.data
    newImageMessages.push({
      createdAt: getDayTime(new Date()),
      user: {
        _id: uid,
        name: name,
        avatar: headPicUrl,
      },
      _id: Math.round(Math.random() * 1000000),
      image: dataURL,
    })
    this.handleUpdateMessages(newImageMessages)

    // 发送图片NIM
    var blob = SDK.NIM.blob.fromDataURL(dataURL)
    const fastPassParams = {
      w: data.width,
      h: data.height,
      // md5: md5,
    }
    console.log('==================', JSON.stringify(fastPassParams))
    nim.instance.previewFile({
      type: 'image',
      blob: blob,
      fastPass: JSON.stringify(fastPassParams),
      uploadprogress: (obj) => {
        console.log('文件总大小: ' + obj.total + 'bytes')
        console.log('已经上传的大小: ' + obj.loaded + 'bytes')
        console.log('上传进度: ' + obj.percentage)
        console.log('上传进度文本: ' + obj.percentageText)
      },
      done: (error, file) => {
        console.log('file', file)
        console.log('上传image' + (!error ? '成功' : '失败'))
        // show file to the user
        if (!error) {
          var msg = nim.instance.sendFile({
            scene: 'p2p',
            to: this.state.frinedInfo.uid,
            file: file,
            done: (error, msg) => {
              console.log('error================' + error)
              console.log('msg==================' + msg)
              if (!error) {
                this.pushMsg(msg)
              }
            },
          })
          console.log('正在发送p2p image消息, id=' + msg.idClient)
          pushMsg(msg)
        }
      },
    })

    // if (data.type === 'image/jpeg') {
    //   const dataURL = 'data:image/jpeg;base64,' + data.data
    //   //console.log('111' + JSON.stringify(SDK.NIM.blob))
    //   var blob = SDK.NIM.blob.fromDataURL(dataURL)
    //   console.log('blob===========', blob)
    //   // const newMd5 = md5.createHash(data.data)
    //   // const newMd5 = md5.createHash(data.uri)
    //   // const newMd5 = md5.createHash(data.path)
    //   // const newMd5 = md5.createHash(blob.data.blobId)
    //   // RNFS.hash(data.path, 'md5').then((md5) => {
    //   // console.log('md5===========', md5)
    //   const fastPassParams = {
    //     w: data.width,
    //     h: data.height,
    //     // md5: md5,
    //   }
    //   // var width = data.width
    //   // var height = data.height
    //   console.log('fastPassParams', fastPassParams)
    //   // const formData = new FormData()
    //   // 需要上传的文件
    //   nim.instance.sendFile({
    //     scene: 'p2p',
    //     to: this.state.frinedInfo.uid,
    //     blob: blob,
    //     //fileInput: file,
    //     fastPass: JSON.stringify(fastPassParams),
    //     beginupload: this.beginupload,
    //     uploadprogress: (obj) => {
    //       console.log('文件总大小: ' + obj.total + 'bytes')
    //       console.log('已经上传的大小: ' + obj.loaded + 'bytes')
    //       console.log('上传进度: ' + obj.percentage)
    //       console.log('上传进度文本: ' + obj.percentageText)
    //     },
    //     uploaddone: (error, file) => {
    //       console.log(error)
    //       console.log(file)
    //       console.log('上传' + (!error ? '成功' : '失败'))
    //     },
    //     beforesend: (msg) => {
    //       console.log('正在发送p2p image消息, id=' + msg.idClient)
    //       pushMsg(msg)
    //     },
    //     done: (error, msg) => {
    //       console.log('error================' + error)
    //       console.log('msg==================' + msg)
    //       if (!error) {
    //         console.log('发送图片', msg)
    //         // this.pushMsg(msg)
    //       }
    //     },
    //   })
    //   // })
    // }
  }

  beginupload = (upload) => {
    console.log('upload', upload)
    // - 如果开发者传入 fileInput, 在此回调之前不能修改 fileInput
    // - 在此回调之后可以取消图片上传, 此回调会接收一个参数 `upload`, 调用 `upload.abort();` 来取消文件上传
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
      if (response.data) {
        // this.onSendByType(response)
      }
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
        {/* {this.state.messages.length === 0 && (
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
        )} */}
        <GiftedChat
          messages={messages}
          onSend={(messages) => {
            this.onSend(messages)
          }}
          showUserAvatar={true}
          locale={'zh-cn'}
          placeholder={'开始聊天吧'}
          renderSend={this.renderSend}
          renderBubble={this.renderBubble}
          // minInputToolbarHeight={70}
          // renderInputToolbar={this.renderInputToolbar}
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
      </>
    )
  }
}

export default connect(bindState, bindActions)(Chatting)

const styles = StyleSheet.create({
  registerBtnBox: {
    width: scaleSize(200),
    height: scaleSize(100),
    borderRadius: scaleSize(80),
    backgroundColor: '#564F5F',
    marginBottom: 4,
  },
  registerBtnText: {
    color: '#fff',
    textAlign: 'center',
    lineHeight: scaleSize(100),
    fontSize: 19,
  },
  sendWrap: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: scaleSize(30),
  },
  icon: {
    width: scaleSize(64),
    height: scaleSize(64),
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
