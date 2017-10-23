import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Grid, Row, Col, Jumbotron, Button } from 'react-bootstrap';

import * as UserActions from '../modules/User';

import FromServer from '../FromServer';
import Header from '../components/Header';
import Concept from '../components/Concept';
import FontAwesome from '../components/FontAwesome';

class Index extends React.Component {
  renderLoginBtn() {
    return (
      <Button bsStyle="primary" bsSize="large" block href="/login">
        <FontAwesome iconName="twitter" />
        Sign in with Twitter
      </Button>
    );
  }

  renderMypageBtn() {
    return (
      <Button bsStyle="primary" bsSize="large" block href="/mypage">
        Go to Mypage
      </Button>
    );
  }

  render() {
    const { user } = FromServer;
    const objUser = user === null ? {} : user;

    return (
      <div>
        <Header user={objUser} path="index" />
        <Grid>
          <Row>
            <Col xs={12}>
              <Jumbotron>
                <h1>Minixer</h1>
                <p>Broadcasting Live Audio More Simply!</p>
              </Jumbotron>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              {user === null ? this.renderLoginBtn() : this.renderMypageBtn()}
            </Col>
          </Row>
          <Row>
            <Concept />
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
)(Index);
