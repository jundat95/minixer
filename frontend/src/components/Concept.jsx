import React from 'react';
import { PageHeader, ListGroup, ListGroupItem } from 'react-bootstrap';

const Concept = () => (
  <div>
    <PageHeader>Concept</PageHeader>
    <ListGroup>
      <ListGroupItem header="Simple">
        <strong>Minixer</strong> only supports live broadcasts to one-to-many.<br />
        If you want to react to live, you can react to broadcasters on function called <strong>Emotion</strong>.
      </ListGroupItem>
      <ListGroupItem header="No Social Graph">
        There are no functions like comments, friends, watch lists, followers, etc.<br />
        If you want to tell your friends that you started broadcasting,
        just share the <strong>Room URL</strong> with SNS such as Twitter or Facebook.
      </ListGroupItem>
      <ListGroupItem header="Free">
        This server will be provided permanently for free and no ads will be displayed.<br />
        Also, publishing the source code <a href="https://github.com/pullphone/minixer">on GitHub</a>,
        you can build your own server.<br />
      </ListGroupItem>
    </ListGroup>
  </div>
);

export default Concept;
