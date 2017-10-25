import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Grid, Row, Col, Button, Alert } from 'react-bootstrap';

import * as UserActions from '../modules/User';

import FromServer from '../FromServer';
import Header from '../components/Header';
import ProfilePanel from '../components/ProfilePanel';
import FontAwesome from '../components/FontAwesome';

class Mypage extends React.Component {
  constructor() {
    super();

    this.state = {
      loginPanel: false,
      reloadedPanel: false,
    };
  }

  componentWillMount() {
    const { status } = FromServer.user;
    if (status === 'login') {
      this.setState({ loginPanel: true });
    } else if (status === 'reloaded') {
      this.setState({ reloadedPanel: true });
    }
  }

  render() {
    const { user } = FromServer;

    return (
      <div>
        <Header user={user} path="mypage" />
        <Grid>
          {this.state.loginPanel ? (
            <Row>
              <Alert bsStyle="success" onDismiss={() => this.setState({ loginPanel: false })}>
                <p>Login successful at {user.name}!</p>
              </Alert>
            </Row>
          ) : null}
          {this.state.reloadedPanel ? (
            <Row>
              <Alert bsStyle="success" onDismiss={() => this.setState({ reloadedPanel: false })}>
                <p>Reload Profile successful at {user.name}!</p>
              </Alert>
            </Row>
          ) : null}
          <Row>
            <Col xs={6}>
              <ProfilePanel />
            </Col>
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
