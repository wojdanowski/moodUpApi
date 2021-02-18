import io from 'socket.io-client';
import chai from 'chai';
import myBackendSockets from './../socket/socket';
import { getUserData, TestUser } from './mockDb';

let socket: SocketIOClient.Socket;
let dummyUser: TestUser;
const serverAddress = 'http://localhost:3000';

describe('Socket tests', (): void => {
  before(async function (): Promise<void> {
    dummyUser = await getUserData();
  });

  beforeEach(done => {
    socket = io.connect(serverAddress, {
      transportOptions: {
        polling: {
          extraHeaders: {
            Authorization: `Bearer ${dummyUser.token}`,
          },
        },
      },
    });

    socket.on('connect', function () {
      console.log(`socketIo-client connected`);
      done();
    });
    socket.on('disconnect', function () {
      console.log(`socketIo-client disconnected`);
    });
  });

  afterEach(done => {
    if (socket.connected) {
      socket.disconnect();
    }
    done();
  });

  describe('socket.io connection', (): void => {
    it('Should be connected', function (done): void {
      const connection = myBackendSockets.connection();
      chai.assert(connection, 'No connection to backend socket');
      done();
    });

    it('Should be connected', function (done): void {
      const connection = myBackendSockets.connection();
      connection.emit('echo', 'Hello from the server');
      socket.on('echo', (message: string): void => {
        chai.assert(message === 'Hello from the server', `Wrong message from server. Received: ${message}`);
        done();
      });
    });
  });
});
