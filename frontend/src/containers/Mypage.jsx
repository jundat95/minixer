import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Grid, Row, Col, Button, Panel, Image } from 'react-bootstrap';

import * as UserActions from '../modules/User';

import FromServer from '../FromServer';
import Header from '../components/Header';
import FontAwesome from '../components/FontAwesome';

class Mypage extends React.Component {
  renderProfile() {
    const { user } = FromServer;

    return (
      <Col xs={6}>
        <Panel header={(<h3>User</h3>)} bsStyle="info">
          <div>
            <Image style={{ width: '100%', maxWidth: 320 }} src={user.profile_image} />
          </div>
          <h4>{user.name}</h4>
          <p>Twitter ID:{user.id}</p>
        </Panel>
      </Col>
    );
  }

  render() {
    const { user } = FromServer;

    return (
      <div>
        <Header user={user} path="mypage" />
        <Grid>
          <Row>
            {this.renderProfile()}
          </Row>
          <Row>
            <Col xs={12}>
              <Button bsStyle="primary" bsSize="large" href="/broadcast" block>
                <FontAwesome iconName="bullhorn" />Start Live Broadcast
              </Button>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user,
});
const mapDispatchToProps = dispatch => ({
  userActions: bindActionCreators(UserActions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Mypage);
