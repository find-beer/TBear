import React, { Fragment } from 'react'
import Video from 'react-native-video'
import { View, Text } from 'react-native'
export default class VideoDisplay extends React.Component {
  constructor(props) {
    super(props)
    console.log('props', props)
    console.log('this.props.route.params.url', this.props.route.params.url)
  }
  render() {
    const url = this.props.route.params.url
    return (
      <View>
        <Video
        style={{width:500,height:500}}
          source={{ uri:  url}}
          videoWidth={1600}
          videoHeight={900}
          muted={false}
        />
      </View>
    )
  }
}
