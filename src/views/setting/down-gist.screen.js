import React from 'react';
import { ScrollView, Button, TextInput } from 'react-native';
import { connect } from 'react-redux';
import styled, { withTheme } from 'styled-components';
import { Text } from 'react-native-elements';
import { ThemeFlex, PrimaryText } from '../../components';
import StateJsonConvert from '../../modules/state-json-convert';
import { changeGistAddress, recoverData } from '../../redux/actions';
import { showToast } from '../../modules/toast';

const Preview = styled(ScrollView)`
  flex: 0 200px;
  margin-bottom: 20px;
`;

class DownGist extends React.Component {
  static navigationOptions = ({ screenProps }) => {
    return {
      title: '从 gist 恢复',
      headerTintColor: screenProps.theme.primaryColor,
      headerStyle: { backgroundColor: screenProps.theme.windowColor },
    };
  };

  props: {
    dispatch: Function,
    settingState: Object,
    gist: Object,
  };

  state = {
    terMsg: '',
    gistAddress: '',
    gistText: '',
    inputStyle: {},
  };

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.setState({ gistAddress: this.props.settingState.gist });
    this.setState({
      inputStyle: {
        borderWidth: 2, height: 40,
        marginBottom: 40, borderColor: this.props.theme.borderColor,
      },
    });
  }

  componentDidMount() {

  }

  onPressGet = async () => {
    this.setState({ terMsg: `开始请求文件...` });
    let pageText = '';
    try {
      pageText = await this.getGist(this.state.gistAddress);
    } catch (err) {
      throw err;
      this.setState({ terMsg: `${this.state.terMsg}\ngist page 请求出错` });
      return;
    }
    this.props.dispatch(changeGistAddress(this.state.gistAddress));
    this.setState({ terMsg: `${this.state.terMsg}\n取到gist page` });
    // 取到 json 地址
    var matchReg = /.*\/.*\/raw.*\/listen1_backup.json/g;
    let afJ = pageText.match(matchReg);
    let gUrl = ''
    if (afJ) {
      gUrl = 'https://gist.githubusercontent.com/' + afJ;
    } else {
      this.setState({ terMsg: `${this.state.terMsg}\n发现 json 地址` });
      return;
    }
    let fileText = '';
    try {
      fileText = await this.getGist(gUrl);
    } catch (err) {
      this.setState({ terMsg: `${this.state.terMsg}\njson 请求出错` });
      return;
    }
    this.setState({ gistText: fileText });
    this.setState({ terMsg: `${this.state.terMsg}\n取到了文件内容` });
    try {
      JSON.parse(this.state.gistText);
    } catch {
      this.setState({ terMsg: '文件内容不符合 json 格式' });
      return;
    }
    this.setState({ terMsg: `${this.state.terMsg}\n文件内容符合 JSON 格式` });
    this.onPressRecover();
    this.setState({ terMsg: `${this.state.terMsg}\n本地歌单已被覆盖` });
    this.setState({ terMsg: `${this.state.terMsg}\n歌单恢复成功，请返回查看` });
  };

  getGist = async (address) => {
    const url = address;
    let response = await fetch(url);
    let responseJson = await response.text();
    return responseJson;
  };

  handleGistChange = (text) => {
    this.setState({ gistAddress: text });
  };

  onPressRecover = () => {
    const json = JSON.parse(this.state.gistText);
    const state = StateJsonConvert.getState(json);

    this.props.dispatch(recoverData(state));
    showToast('恢复成功,请返回');
  };

  render() {
    return (
      <ThemeFlex style={{ padding: 20 }}>
        <Text style={{ fontSize: 20, marginBottom: 10, color: this.props.theme.primaryColor }}> 填入 GITHUB gist
          文件地址：</Text>
        <TextInput value={this.state.gistAddress} onChangeText={this.handleGistChange}
                   style={{
                     borderWidth: 2, height: 40, marginBottom: 40,
                     borderColor: this.props.theme.borderColor, color: this.props.theme.primaryColor,
                   }}></TextInput>
        <Button title='恢复到本地' onPress={this.onPressGet} />
        <Text style={{ fontSize: 15, marginTop: 20, color: this.props.theme.primaryColor }}> 恢复详情： </Text>
        <Preview>
          <PrimaryText style={{
            borderWidth: 1, minHeight: 100, marginTop: 5,
            borderColor: this.props.theme.borderColor, color: this.props.theme.primaryColor,
          }}> {this.state.terMsg} </PrimaryText>
        </Preview>
      </ThemeFlex>
    );
  }
}

const mapStateToProps = ({ settingState }) => ({
  settingState,
});

export default connect(mapStateToProps)(withTheme(DownGist));
