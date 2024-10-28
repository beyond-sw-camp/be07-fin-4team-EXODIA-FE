<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="room-create-card">
          <v-card-title class="headline">회의실 생성</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="createRoom">
              <v-text-field v-model="roomName" label="회의실 이름" required outlined dense></v-text-field>
              <v-checkbox v-model="usePassword" label="비밀번호 설정" dense></v-checkbox>
              <v-slide-y-transition>
                <div v-if="usePassword">
                  <v-text-field v-model="password" label="비밀번호" type="password" outlined dense></v-text-field>
                  <v-text-field v-model="confirmPassword" label="비밀번호 확인" type="password" outlined dense
                    :error-messages="passwordError"></v-text-field>
                </div>
              </v-slide-y-transition>
              <v-card-actions>
                <v-btn v-create @click="createRoom">생성</v-btn>
                <v-btn v-delete @click="close">닫기</v-btn>
              </v-card-actions>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';
import Janus from 'janus-gateway'; // Janus 추가

export default {
  name: 'CreateVideoRoom',
  data() {
    return {
      roomName: '',
      usePassword: false,
      password: '',
      confirmPassword: '',
      passwordError: '',
      janus: null, // Janus 객체 저장
      videoRoomPlugin: null, // Janus의 video room plugin 저장
      opaqueId: "videoroomcreate-" + Janus.randomString(12), // 고유 ID 생성
    };
  },
  methods: {
    async createRoom() {
      if (this.usePassword && this.password !== this.confirmPassword) {
        this.passwordError = '비밀번호가 일치하지 않습니다.';
        return;
      }

      // Janus 서버에 방 생성 로직 추가
      Janus.init({
        debug: "all",
        callback: () => {
          this.janus = new Janus({
            server: "http://43.201.35.213:8088/janus", // Janus 서버 주소
            apisecret: "mySuperSuperSecretKey", // Janus API 시크릿
            success: this.attachToVideoRoomPlugin,
            error: (error) => {
              console.error("Janus 연결 실패:", error);
              alert("Janus 서버에 연결할 수 없습니다.");
            },
            destroyed: () => {
              console.log("Janus 세션 종료");
            }
          });
        }
      });
    },

    attachToVideoRoomPlugin() {
      this.janus.attach({
        plugin: "janus.plugin.videoroom",
        opaqueId: this.opaqueId,
        success: (pluginHandle) => {
          this.videoRoomPlugin = pluginHandle;
          console.log("Janus Video Room Plugin에 연결됨: ", pluginHandle);
          this.createJanusRoom(); // 방 생성
        },
        error: (error) => {
          console.error("Plugin 연결 실패:", error);
        },

      });
    },

    createJanusRoom() {
      const create = {
        request: "create",
        room: Math.floor(Math.random() * 1000000),  // 방 ID 생성 (랜덤 값 사용)
        permanent: false,
        publishers: 6, // 최대 참여자 수 설정
        description: this.roomName,
        secret: this.usePassword ? this.password : ''
      };

      this.videoRoomPlugin.send({
        message: create,
        success: (result) => {
          if (result.videoroom === "created") {
            const roomId = result.room;  // 생성된 roomId
            console.log("Janus 방 생성 완료, ID:", roomId);
            this.saveRoomToBackend(roomId); // 방을 백엔드에 저장
          } else {
            console.error("방 생성 실패: 결과에 room 정보가 없음");
          }
        },
        error: (error) => {
          console.error("Janus 방 생성 실패:", error);
        }
      });
    },

    async saveRoomToBackend(janusRoomId) {
      try {
        const roomData = {
          roomName: this.roomName,
          password: this.usePassword ? this.password : '',
          janusRoomId: janusRoomId // Janus에서 받은 방 ID를 함께 백엔드에 저장
        };
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/api/video/create`, roomData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log('백엔드에 방 저장 완료:', response.data);
        alert('회의실이 생성되었습니다!');
        this.$router.push('/video/rooms');
      } catch (e) {
        console.error('방 생성 중 오류 발생:', e);
        alert('방 생성에 실패했습니다.');
      }
    },
    close() {
      this.$router.push('/video/rooms');
    }
  }
};
</script>

<style scoped>
.room-create-card {
  background-color: #f8f8f8;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.headline {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #4CAF50;
}

.v-btn {
  margin-top: 16px;
  font-weight: bold;
  background-color: #4CAF50;
}

.v-btn:hover {
  background-color: #45a049;
}

.v-checkbox {
  margin-top: 16px;
}
</style>
