import React from 'react';
import { Panel, Button, Image } from 'react-bootstrap';

import Util from '../Util';
import FromServer from '../FromServer';

const { user } = FromServer;
const isReloadable = (Util.getTimestamp() - user.last_loaded_at) >= 300;
const ProfilePanel = () => (
  <Panel header={(<h3>User</h3>)} bsStyle="info">
    <div>
      <Image style={{ width: '100%', maxWidth: 320 }} src={user.profile_image} />
    </div>
    <h4>{user.name}</h4>
    <p>Twitter ID:{user.id}</p>
    {user.status === null && isReloadable ? (
      <Button bsStyle="warning" href="/reload_profile" block>Reload Profile</Button>
    ) : null}
  </Panel>
);

export default ProfilePanel;
