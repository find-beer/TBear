const SDK = require('../../nim/NIM_Web_SDK_rn_v7.2.0')
// import AsyncStorage from '@react-native-community/async-storage'
// AsyncStorage.getItem('userInfo', (error, result) => {
//   if (result) {
//     console.log('result', result)
//     // this.setState({
//     //   userInfo:JSON.parse(result)
//     // })
//   }
// })

// var data = {}
// var nim = SDK.NIM.getInstance({
//   debug: true,
//   appKey: '67b35e65c41efd1097ef8504d5a88455',
//   token,
//   account: accid,
//   db: false, // 不使用数据库
//   onfriends: onFriends,
//   onsyncfriendaction: onSyncFriendAction,
//   onofflinesysmsgs: onOfflineSysMsgs,
//   onsysmsg: onSysMsg,
//   onupdatesysmsg: onUpdateSysMsg,
//   onsysmsgunread: onSysMsgUnread,
//   onupdatesysmsgunread: onUpdateSysMsgUnread,
//   onofflinecustomsysmsgs: onOfflineCustomSysMsgs,
//   oncustomsysmsg: onCustomSysMsg,
//   syncBroadcastMsgs: true, // 是否同步离线广播消息，默认false
//   onbroadcastmsg: onBroadcastMsg, // 收到广播消息的回调
//   onbroadcastmsgs: onBroadcastMsgs, // 登录后同步到离线广播消息的回调
// })

// function onFriends(friends) {
//   console.log('收到好友列表', friends)
//   data.friends = nim.mergeFriends(data.friends, friends)
//   data.friends = nim.cutFriends(data.friends, friends.invalid)
//   refreshFriendsUI()
// }
// function onSyncFriendAction(obj) {
//   console.log(obj)
//   switch (obj.type) {
//     case 'addFriend':
//       console.log(
//         '你在其它端直接加了一个好友' + obj.account + ', 附言' + obj.ps
//       )
//       onAddFriend(obj.friend)
//       break
//     case 'applyFriend':
//       console.log(
//         '你在其它端申请加了一个好友' + obj.account + ', 附言' + obj.ps
//       )
//       break
//     case 'passFriendApply':
//       console.log(
//         '你在其它端通过了一个好友申请' + obj.account + ', 附言' + obj.ps
//       )
//       onAddFriend(obj.friend)
//       break
//     case 'rejectFriendApply':
//       console.log(
//         '你在其它端拒绝了一个好友申请' + obj.account + ', 附言' + obj.ps
//       )
//       break
//     case 'deleteFriend':
//       console.log('你在其它端删了一个好友' + obj.account)
//       onDeleteFriend(obj.account)
//       break
//     case 'updateFriend':
//       console.log('你在其它端更新了一个好友', obj.friend)
//       onUpdateFriend(obj.friend)
//       break
//   }
// }
// function onAddFriend(friend) {
//   data.friends = nim.mergeFriends(data.friends, friend)
//   refreshFriendsUI()
// }
// function onDeleteFriend(account) {
//   data.friends = nim.cutFriendsByAccounts(data.friends, account)
//   refreshFriendsUI()
// }
// function onUpdateFriend(friend) {
//   data.friends = nim.mergeFriends(data.friends, friend)
//   refreshFriendsUI()
// }
// function refreshFriendsUI() {
//   // 刷新界面
// }

// function onOfflineSysMsgs(sysMsgs) {
//   console.log('收到离线系统通知', sysMsgs);
//   pushSysMsgs(sysMsgs);
// }
// function onSysMsg(sysMsg) {
//   console.log('收到系统通知', sysMsg)
//   pushSysMsgs(sysMsg);
// }
// function onUpdateSysMsg(sysMsg) {
//   pushSysMsgs(sysMsg);
// }
// function pushSysMsgs(sysMsgs) {
//   data.sysMsgs = nim.mergeSysMsgs(data.sysMsgs, sysMsgs);
//   refreshSysMsgsUI();
// }
// function onSysMsgUnread(obj) {
//   console.log('收到系统通知未读数', obj);
//   data.sysMsgUnread = obj;
//   refreshSysMsgsUI();
// }
// function onUpdateSysMsgUnread(obj) {
//   console.log('系统通知未读数更新了', obj);
//   data.sysMsgUnread = obj;
//   refreshSysMsgsUI();
// }
// function refreshSysMsgsUI() {
//   // 刷新界面
// }
// function onOfflineCustomSysMsgs(sysMsgs) {
//   console.log('收到离线自定义系统通知', sysMsgs);
// }
// function onCustomSysMsg(sysMsg) {
//   console.log('收到自定义系统通知', sysMsg);
// }
// function onBroadcastMsg(msg) {
//   console.log('收到广播消息', msg);
// }
// function onBroadcastMsgs(msgs) {
//   console.log('收到广播消息', msgs);
// }
