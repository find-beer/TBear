const Realm = require('realm')

const TeamInviteSchema = {
  name: 'TeamInvite2',
  primaryKey: 'id',
  properties: {
    id: 'int',
    TeamInviteNotify: 'string',
  },
}

// const ApplyFriendSchema = {
//   name: 'ApplyFriend',
//   primaryKey: 'id',
//   properties: {
//     id: 'int',
//     category: 'string',
//     from: 'string',
//     idServer: 'string',
//     ps: 'string',
//     read: 'bool',
//     state: 'string',
//     status: 'string',
//     time: 'date',
//     to: 'string',
//     type: 'string',
//   },
// }

// 2)根据提供的表初始化 Realm，可同时往数组中放入多个表
let TeamInviteRealm = new Realm({
  schema: [TeamInviteSchema],
})

export { TeamInviteRealm }
