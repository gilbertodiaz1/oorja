import AbstractConnector from './AbstractConnector';

import roomActivities from '../../ui/components/room/constants/roomActivities';

class LicodeConnector extends AbstractConnector {
  constructor(yConfig, connectorOptions) {
    // console.log(yConfig, connectorOptions);
    super(yConfig, connectorOptions);
    this.connectorOptions = connectorOptions;
    const { roomAPI, connectedUsers, tabInfo } = connectorOptions;
    // this should be unique I guess. eg. when a user logs in with
    // same account from different devices.
    this.setUserId(roomAPI.getUserId());

    const self = this;
    roomAPI.addActivityListner(roomActivities.USER_JOINED, (user) => {
      console.info('user joined');
      self.userJoined(user.userId, 'slave');
    });
    roomAPI.addActivityListner(roomActivities.USER_LEFT, (user) => {
      console.info('user left');
      self.userLeft(user.userId);
    });

    roomAPI.addMessageHandler(tabInfo.tabId, (message) => {
      console.info('message recieved');
      self.receiveMessage(message.from, message.content);
    });

    connectedUsers.forEach((user) => {
      this.userJoined(user.userId, 'slave');
    });
  }

  disconnect() {
    super.disconnect();
  }
  reconnect() {
    super.reconnect();
  }

  send(recieverId, content) {
    const { connectorOptions } = this;
    const tabId = connectorOptions.tabInfo.tabId; // our own tab
    const message = {
      sourceTab: tabId,
      destinationTabs: [tabId],
      from: connectorOptions.roomAPI.getUserId(),
      to: [recieverId],
      content,
    };
    console.info('sending message');
    connectorOptions.roomAPI.sendMessage(message);
  }

  broadcast(content) {
    const { connectorOptions } = this;
    const tabId = connectorOptions.tabInfo.tabId; // our own tab
    const message = {
      sourceTab: tabId,
      destinationTabs: [tabId],
      from: connectorOptions.roomAPI.getUserId(),
      broadcast: true,
      content,
    };
    console.info('broadcasting message');
    connectorOptions.roomAPI.sendMessage(message);
  }

  isDisconnected() {
    return false;
  }
}

export default LicodeConnector;