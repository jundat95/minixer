import React from 'react';
import PropTypes from 'prop-types';
import { Nav, Navbar, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';

export default class Header extends React.Component {
  renderLoginUser() {
    const { user } = this.props;

    const imgStyle = { width: 24 };
    return (
      <span>
        <img src={user.profile_image} alt="profile_image" style={imgStyle} />
        {user.name}
      </span>
    );
  }

  renderNavItem(path, name) {
    // Navbar.Collapse のとき NavItem 内の <a> タグが機能しないバグがあるらしいので一時的に対応
    const handleClick = (e) => {
      e.preventDefault();
      window.location.href = path;
    };

    return (
      <NavItem eventKey={path.substr(1)} href={path} onClick={e => handleClick(e)}>
        {name}
      </NavItem>
    );
  }

  renderMenus() {
    return (
      <Navbar.Collapse>
        <Nav activeKey={this.props.path}>
          {this.renderNavItem('/mypage', 'Mypage')}
          {this.renderNavItem('/broadcast', 'Broadcast')}
        </Nav>
        <Nav pullRight>
          <NavDropdown title={this.renderLoginUser()} id="nav-dropdown-login-user">
            <MenuItem href="/logout">Logout</MenuItem>
          </NavDropdown>
        </Nav>
      </Navbar.Collapse>
    );
  }

  render() {
    const { user } = this.props;

    return (
      <Navbar inverse collapseOnSelect>
        <Navbar.Header>
          <Navbar.Brand>
            <a href="/">Minixer</a>
          </Navbar.Brand>
          {user.id !== undefined ? <Navbar.Toggle /> : null}
        </Navbar.Header>
        {user.id !== undefined ? this.renderMenus() : null}
      </Navbar>
    );
  }
}

Header.propTypes = {
  user: PropTypes.object.isRequired,
  path: PropTypes.string.isRequired,
};
