const SDK = require('../../nim/NIM_Web_SDK_rn_v7.2.0.js')
import { getStorage } from '../utils/storage'
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
  console.log('收到消息', msg.scene, msg.type, msg)
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
  console.log('pushMsg===========================', msgs)
  if (!Array.isArray(msgs)) {
    msgs = [msgs]
  }
  var sessionId = msgs[0].scene + '-' + msgs[0].to
  data.msgs = data.msgs || {}
  data.msgs[sessionId] = instance.mergeMsgs(data.msgs[sessionId], msgs)
  console.log('data', data)
}

const nimDB = () => {
  return data
}
// 加好友

// 群聊
export { initNIM, sendMessage, nimDB }
