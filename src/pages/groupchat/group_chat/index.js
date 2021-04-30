import { View, Image, Text, StyleSheet, DeviceEventEmitter } from 'react-native'
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
import * as nim from '../../../utils/nim'
import { getDayTime } from '../../../utils/date'
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
    console.log('this.props.userInfo===================', this.props.userInfo)
    this.state = {
      id: props.route.params.activeId, //活动Id
      messages: [],
      userInfo: this.props.userInfo,
      activityData: {},
      teamsMessages: [],
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
        // 获取历史记录
        this.fetchHistoryMessages(this.state.activityData.payGroupId)
      })
    }
  }

  componentDidMount() {
    // 获取活动详情
    this.requireActivityData()

    this.event = DeviceEventEmitter.addListener('fetchTeamMessages', (msgObj) => {
      console.log('DeviceEventEmitter==========================', msgObj)
      if (msgObj) {
        const key = 'team' + '-' + this.state.activityData.payGroupId
        const msg = msgObj[key]
        //注册通知
        if (msg === undefined) return
        // 接收信息
        // const { uid, name, headPicUrl } = this.state.frinedInfo
        let acceptMessage = []
        acceptMessage.push({
          createdAt: getDayTime(msg.time),
          text: msg.text,
          user: {
            _id: msg.from,
            name: msg.fromNick,
            // avatar: headPicUrl,
          },
          _id: Math.round(Math.random() * 1000000),
        })
        // 更新UI信息
        this.handleUpdateMessages(acceptMessage)
      }
    })

  }

  fetchHistoryMessages = (account) => {
    nim.instance.getHistoryMsgs({
      scene: 'team',
      to: account,
      done: this.getHistoryMessages,
    })
  }

  getHistoryMessages = (error, obj) => {
    console.log('获取team历史消息' + (!error ? '成功' : '失败'))
    console.log(error)
    console.log(obj)
    if (!error) {
      console.log('obj.msgs======================>', obj.msgs)
      this.setState(
        {
          teamsMessages: obj.msgs,
        },
        () => {
          this.fixData(this.state.teamsMessages)
        }
      )
    }
  }

  fixData(messages) {
    // 2）时间排序
    messages.sort((a, b) => {
      return b.time < a.time ? 1 : -1
    })
    console.log('messages===============', messages)
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
        newMessages.push({
          createdAt: getDayTime(messages[i].time),
          text: messages[i].text,
          user: {
            _id: messages[i].from,
            name: messages[i].fromNick,
            // avatar: messages[0].attach.users[0].avatar,
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

  componentWillUnmount() {
    this.event.remove()
  }
  onRightClick = () => {
    console.log('拉人入群')
    const { activityTitle, payGroupId, groupId } = this.state.activityData
    const { navigation } = this.props
    navigation.navigate('ChatSetting', { teamId: payGroupId })
  }
  onSend(newMessages = []) {
    const { payGroupId } = this.state.activityData
    // 发送nim信息
    nim.sendMessage('team', payGroupId, newMessages[0].text)
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

  render() {
    const { messages } = this.state
    const { activityTitle, payGroupId, groupId } = this.state.activityData
    const { name, headPicUrl, uid } = this.state.userInfo
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
          renderSend={this.renderSend}
          renderBubble={this.renderBubble}
          showUserAvatar={true}
          locale={'zh-cn'}
          placeholder={'开始聊天吧'}
          showUserAvatar={true}
          alwaysShowSend={true}
          user={{
            _id: uid,
            name: name,
            avatar: headPicUrl,
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
