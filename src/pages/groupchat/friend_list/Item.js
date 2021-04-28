import React from 'react'
import {
  Text,
  View,
  StyleSheet,
  Image,
  Fragment,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from 'react-native'
import { color } from 'react-native-reanimated'
import { GetRequest } from '../../../utils/request'
import { scaleSize, scaleFont } from '../../../utils/scaleUtil'
export default class Item extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
    console.log('props', props)
  }

  shouldComponentUpdate(nextProps, nextState) {
    console.log('nextProps==============>', nextProps)
    console.log('nextState===============>', nextState)
    return (
      this.props.item != nextProps.item || this.props.select != nextProps.select
    )
  }

  render() {
    const { item } = this.props
    console.log('this.props', this.props)
    return (
      <TouchableOpacity onPress={this.props.onPress}>
        <View style={styles.friendItem}>
          {item.select ? (
            <View style={styles.circleSelect}></View>
          ) : (
            <View style={styles.circle}></View>
          )}

          <Image
            style={styles.itemHeadPic}
            source={{
              uri:
                item.headPicUrl ||
                'https://ss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=1817066819,1530157012&fm=11&gp=0.jpg',
            }}
          />
          <Text style={styles.friendTxt}>{item.name || '探熊'}</Text>
        </View>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  friendTxt: {
    flex: 1,
    color: '#333',
    fontSize: scaleFont(48),
  },
  friendItem: {
    height: scaleSize(240),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: scaleSize(2),
    borderColor: '#f2f2f2',
    borderStyle: 'solid',
  },
  itemHeadPic: {
    width: scaleSize(132),
    height: scaleSize(132),
    marginRight: scaleSize(42),
  },
  circleSelect: {
    width: scaleSize(60),
    height: scaleSize(60),
    borderRadius: scaleSize(30),
    borderWidth: scaleSize(2),
    borderColor: '#ccc',
    backgroundColor: '#ccc',
    borderStyle: 'solid',
    marginRight: scaleSize(60),
  },
  circle: {
    width: scaleSize(60),
    height: scaleSize(60),
    borderRadius: scaleSize(30),
    borderWidth: scaleSize(2),
    borderColor: '#ccc',
    borderStyle: 'solid',
    marginRight: scaleSize(60),
  },
  friendList: {
    height: scaleSize(240),
  },

  checkbox: {
    alignSelf: 'center',
  },
})
