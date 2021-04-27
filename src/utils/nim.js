const SDK = require('../../nim/NIM_Web_SDK_rn_v7.2.0.js')
import { getStorage } from './storage'
import { DeviceEventEmitter } from 'react-native'

let instance
let data = {}
// 初始化sdk
const initNIM = async (account, token) => {
  console.log('初始化sdk')
  const userInfo = await getStorage('userInfo')
  const { iminfo } = userInfo
  if (iminfo) {
    const { accid, token } = iminfo
    instance = SDK.NIM.getInstance({
      debug: true,
      appKey: '67b35e65c41efd1097ef8504d5a88455',
      token,
      account: accid,
      db: false, // 使用数据库
      onconnect: onConnect,
      onwillreconnect: onWillReconnect,
      ondisconnect: onDisconnect,
      onerror: onError,
      onroamingmsgs: onRoamingMsgs,
      onofflinemsgs: onOfflineMsgs,
      onmsg: onMsg,
      onfriends: onFriends,
      onsyncfriendaction: onSyncFriendAction,
      onofflinesysmsgs: onOfflineSysMsgs,
      onsysmsg: onSysMsg,
      onupdatesysmsg: onUpdateSysMsg,
      onsysmsgunread: onSysMsgUnread,
      onupdatesysmsgunread:onUpdateSysMsgUnread,
    })
  }
  console.log('db============================', instance.support.db)
}

// 单聊
onConnect = (options) => {
  console.log('onConnect', options)
}

onWillReconnect = (onWillReconnect) => {
  console.log('onConnect', options)
}

onDisconnect = (options) => {
  console.log('onDisconnect', options)
}

onError = (options) => {
  console.log('onError', options)
}

onRoamingMsgs = (options) => {
  pushMsg(options.msgs)
  console.log('收到漫游消息', options)
}

onOfflineMsgs = (options) => {
  pushMsg(options.msgs)
  console.log('收到离线消息', options)
}

onMsg = (msg) => {
  pushMsg(msg)
  console.log('onMsg=========================', msg)
  console.log('收到消息', msg.scene, msg.type, msg)
   //发送通知 第一个参数是通知名称，后面的参数是发送的值可以多个
   DeviceEventEmitter.emit('fetchMessages', msg)
}

const sendMsgDone = (error, msg) => {
  console.log(
    '发送' +
      msg.scene +
      ' ' +
      msg.type +
      '消息' +
      (!error ? '成功' : '失败') +
      ', id=' +
      msg.idClient
  )
  pushMsg(msg)
}

const sendMessage = (account, text) => {
  console.log('instance', instance)
  var msg = instance.sendText({
    scene: 'p2p',
    to: account,
    text: text,
    done: sendMsgDone,
  })
}

const pushMsg = (msgs) => {
  if (!Array.isArray(msgs)) {
    msgs = [msgs]
  }
  var sessionId = msgs[0].scene + '-' + msgs[0].to
  data.msgs = data.msgs || {}
  data.msgs[sessionId] = instance.mergeMsgs(data.msgs[sessionId], msgs)
}

const nimDB = data


// 加好友
const onOfflineSysMsgs = (sysMsgs) => {
  console.log('收到离线系统通知', sysMsgs)
  pushSysMsgs(sysMsgs)
}
const onSysMsg = (sysMsg) => {
  console.log('收到系统通知', sysMsg)
  pushSysMsgs(sysMsg)
   //发送通知 第一个参数是通知名称，后面的参数是发送的值可以多个
   DeviceEventEmitter.emit('fetchSysMsg', sysMsg)
}
const onUpdateSysMsg = (sysMsg) => {
  pushSysMsgs(sysMsg)
}

pushSysMsgs = (sysMsgs) => {
  data.sysMsgs = instance.mergeSysMsgs(data.sysMsgs, sysMsgs)
}

const onSysMsgUnread = (obj) => {
  console.log('收到系统通知未读数', obj)
  data.sysMsgUnread = obj
  refreshSysMsgsUI()
}
const onUpdateSysMsgUnread = (obj) => {
  console.log('系统通知未读数更新了', obj)
  data.sysMsgUnread = obj
  refreshSysMsgsUI()
}
const refreshSysMsgsUI = () => {
  // 刷新界面
}
const onFriends = (friends) => {
  console.log('收到好友列表', friends)
  data.friends = instance.mergeFriends(data.friends, friends)
  data.friends = instance.cutFriends(data.friends, friends.invalid)
  refreshFriendsUI()
}

const onSyncFriendAction = (obj) => {
  console.log(obj)
  switch (obj.type) {
    case 'addFriend':
      console.log(
        '你在其它端直接加了一个好友' + obj.account + ', 附言' + obj.ps
      )
      onAddFriend(obj.friend)
      break
    case 'applyFriend':
      console.log(
        '你在其它端申请加了一个好友' + obj.account + ', 附言' + obj.ps
      )
      break
    case 'passFriendApply':
      console.log(
        '你在其它端通过了一个好友申请' + obj.account + ', 附言' + obj.ps
      )
      onAddFriend(obj.friend)
      break
    case 'rejectFriendApply':
      console.log(
        '你在其它端拒绝了一个好友申请' + obj.account + ', 附言' + obj.ps
      )
      break
    case 'deleteFriend':
      console.log('你在其它端删了一个好友' + obj.account)
      onDeleteFriend(obj.account)
      break
    case 'updateFriend':
      console.log('你在其它端更新了一个好友', obj.friend)
      onUpdateFriend(obj.friend)
      break
  }
}

const onAddFriend = (friend) => {
  data.friends = instance.mergeFriends(data.friends, friend)
  serverAddFriend()
  refreshFriendsUI()
}

const onDeleteFriend = (account) => {
  data.friends = instance.cutFriendsByAccounts(data.friends, account)
  refreshFriendsUI()
}

const onUpdateFriend = (friend) => {
  data.friends = instance.mergeFriends(data.friends, friend)
  refreshFriendsUI()
}

const refreshFriendsUI = () => {
  // 刷新界面
}

// 群聊
export { initNIM, sendMessage, nimDB, instance }
