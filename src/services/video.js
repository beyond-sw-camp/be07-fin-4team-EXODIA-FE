// src/services/video.js
import Janus from 'janus-gateway';

const JANUS_SERVER = 'http://ec2-3-39-254-7.ap-northeast-2.compute.amazonaws.com:8088/janus';

export default {
  janus: null,
  sfutest: null,

  // Janus 초기화
  initJanus(callback) {
    Janus.init({
      debug: 'all',
      callback: () => {
        this.createSession(callback);
      }
    });
  },

  // Janus 세션 생성
  createSession(callback) {
    this.janus = new Janus({
      server: JANUS_SERVER,
      success: () => {
        this.janus.attach({
          plugin: 'janus.plugin.videoroom',
          success: (pluginHandle) => {
            this.sfutest = pluginHandle;
            console.log('VideoRoom 플러그인 연결 성공');
            callback(this.sfutest);
          },
          error: (error) => {
            console.error('플러그인 연결 오류', error);
          }
        });
      },
      error: (error) => {
        console.error('Janus 서버 연결 오류', error);
      }
    });
  },

  // 비디오룸에 참여
  joinRoom(roomId, displayName, callback) {
    this.sfutest.send({
      message: {
        request: 'join',
        room: roomId,
        ptype: 'publisher',
        display: displayName
      },
      success: (response) => {
        console.log('방 참여 성공', response);
        if (response.videoroom === 'joined') {
          callback(response);
        }
      }
    });
  },

  // 로컬 스트림 전송
  publishOwnFeed(stream) {
    this.sfutest.createOffer({
      media: { video: true, audio: true },
      stream: stream,
      success: (jsep) => {
        const publish = { request: 'publish', audio: true, video: true };
        this.sfutest.send({ message: publish, jsep: jsep });
      },
      error: (error) => {
        console.error('로컬 비디오 송출 오류:', error);
      }
    });
  }
};
