const SDK = require('../../nim/NIM_Web_SDK_rn_v7.2.0.js')
import { DeviceEventEmitter } from 'react-native'
import { setStorage, getStorage, removeStorage } from '../utils/storage'
const Realm = require('realm')
// 此处将外置的realm数据库挂载到sdk上，供sdk使用
SDK.usePlugin({
  db: Realm,
})
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
      account: accid,
      token,
      db: true, // 使用数据库
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
      onupdatesysmsgunread: onUpdateSysMsgUnread,
      onteams: onTeams,
      onsynccreateteam: onCreateTeam,
      onteammembers: onTeamMembers,
      //onsyncteammembersdone: onSyncTeamMembersDone,
      onupdateteammember: onUpdateTeamMember,
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
  var sessionId = msg.scene + '-' + msg.from
  var msgObj = {}
  msgObj[sessionId] = msg
  //发送通知 第一个参数是通知名称，后面的参数是发送的值可以多个
  DeviceEventEmitter.emit('fetchMessages', msgObj)
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
  // console.log('data.msgs[sessionId]==============',data)
  // DeviceEventEmitter.emit('fetchMessages', data)
}

const nimDB = data

// 加好友
onOfflineSysMsgs = (sysMsgs) => {
  console.log('收到离线系统通知', sysMsgs)
  pushSysMsgs(sysMsgs)
}
onSysMsg = (sysMsg) => {
  console.log('收到系统通知', sysMsg)
  pushSysMsgs(sysMsg)
  //发送通知 第一个参数是通知名称，后面的参数是发送的值可以多个

  DeviceEventEmitter.emit('fetchSysMsg', sysMsg)
  // 入群邀请
  // let teamsList = []
  // if (sysMsg.type === 'teamInvite') {
  //   teamsList.push(sysMsg)
  //   const oldTeams = []
  //   oldTeams = (await getStorage('teams')) || []

  //   console.log('oldTeams=================', oldTeams)
  //   console.log('oldTeams=================', teamsList)

  //   setStorage('teams', [...teamsList, ...oldTeams])
  // }
}
onUpdateSysMsg = (sysMsg) => {
  pushSysMsgs(sysMsg)
}

pushSysMsgs = (sysMsgs) => {
  data.sysMsgs = instance.mergeSysMsgs(data.sysMsgs, sysMsgs)
}

onSysMsgUnread = (obj) => {
  console.log('收到系统通知未读数', obj)
  data.sysMsgUnread = obj
  refreshSysMsgsUI()
}
onUpdateSysMsgUnread = (obj) => {
  console.log('系统通知未读数更新了', obj)
  data.sysMsgUnread = obj
  refreshSysMsgsUI()
}
refreshSysMsgsUI = () => {
  // 刷新界面
}
onFriends = (friends) => {
  console.log('收到好友列表', friends)
  data.friends = instance.mergeFriends(data.friends, friends)
  data.friends = instance.cutFriends(data.friends, friends.invalid)
  refreshFriendsUI()
}

onSyncFriendAction = (obj) => {
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

onAddFriend = (friend) => {
  data.friends = instance.mergeFriends(data.friends, friend)
  serverAddFriend()
  refreshFriendsUI()
}

onDeleteFriend = (account) => {
  data.friends = instance.cutFriendsByAccounts(data.friends, account)
  refreshFriendsUI()
}

onUpdateFriend = (friend) => {
  data.friends = instance.mergeFriends(data.friends, friend)
  refreshFriendsUI()
}

refreshFriendsUI = () => {
  // 刷新界面
}

// 群聊
onTeams = (teams) => {
  console.log('收到群列表', teams)
  data.teams = instance.mergeTeams(data.teams, teams)
  onInvalidTeams(teams.invalid)
  //发送通知 第一个参数是通知名称，后面的参数是发送的值可以多个
  DeviceEventEmitter.emit('fetchOnTeams', teams)
}
onInvalidTeams = (teams) => {
  console.log('收到群邀请列表', teams)
  data.teams = instance.cutTeams(data.teams, teams)
  data.invalidTeams = instance.mergeTeams(data.invalidTeams, teams)
  refreshTeamsUI()
}
onCreateTeam = (team) => {
  console.log('你创建了一个群', team)
  data.teams = instance.mergeTeams(data.teams, team)
  refreshTeamsUI()
  onTeamMembers({
    teamId: team.teamId,
    members: owner,
  })
}
refreshTeamsUI = () => {
  // 刷新界面
}
onTeamMembers = (obj) => {
  console.log('群id', teamId, '群成员', members)
  var teamId = obj.teamId
  var members = obj.members
  data.teamMembers = data.teamMembers || {}
  data.teamMembers[teamId] = instance.mergeTeamMembers(
    data.teamMembers[teamId],
    members
  )
  data.teamMembers[teamId] = instance.cutTeamMembers(
    data.teamMembers[teamId],
    members.invalid
  )
  refreshTeamMembersUI()
}
// function onSyncTeamMembersDone() {
//     console.log('同步群成员列表完成');
// }
onUpdateTeamMember = (teamMember) => {
  console.log('群成员信息更新了', teamMember)
  onTeamMembers({
    teamId: teamMember.teamId,
    members: teamMember,
  })
}
refreshTeamMembersUI = () => {
  // 刷新界面
}

export { initNIM, sendMessage, nimDB, instance }
