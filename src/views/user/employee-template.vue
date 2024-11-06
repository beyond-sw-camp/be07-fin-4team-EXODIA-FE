<template>
  <v-container class="mt-5">
    <v-card v-if="dataLoaded || isRegisterMode" class="mx-auto" max-width="800">
      <v-card-title>
        <div v-if="isEditMode" class="text-right">
          <v-btn v-list @click="goBack" outlined>목록으로</v-btn>
          <v-btn v-delete @click="deleteUser()">삭제</v-btn>
        </div>
        <h3 v-if="isEditMode">직원 수정</h3>
        <h3 v-else-if="isDetailMode">직원 세부 정보</h3>
        <h3 v-else>직원 등록</h3>
      </v-card-title>

      <v-card-text>
        <v-form ref="form" @submit.prevent="submitForm">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="userDetail.userNum"
                label="사번"
                :readonly="isEditMode || isDetailMode"
                :error="!userDetail.userNum && showErrors"
                required
              />
              <span v-if="!userDetail.userNum && showErrors" class="error-text">사번을 입력해주세요.</span>
            </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="userDetail.name"
              label="이름"
              :readonly="isDetailMode"
              :error="!userDetail.name && showErrors"
              required
            />
            <span v-if="!userDetail.name && showErrors" class="error-text">이름을 입력해주세요.</span>
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="userDetail.gender"
              :items="genderOptions"
              label="성별"
              :disabled="isDetailMode"
              :error="!userDetail.gender && showErrors"
              required
            />
            <span v-if="!userDetail.gender && showErrors" class="error-text">성별을 선택해주세요.</span>
          </v-col>
          

            <!-- 부서 선택 -->
            <v-col cols="12" md="6">
              <v-select
                v-model="userDetail.departmentId"
                :items="departmentOptions"
                item-title="name"
                item-value="id"
                label="부서"
                :disabled="isDetailMode"
                :error="!userDetail.departmentId && showErrors"
                required
                v-if="departmentOptions.length > 0"
              />
              <span v-if="!userDetail.departmentId && showErrors" class="error-text">부서를 선택해주세요.</span>
            </v-col>
            

            <!-- 직급 선택 -->
            <v-col cols="12" md="6">
              <v-select
                v-model="userDetail.positionId"
                :items="positionOptions"
                item-title="name"
                item-value="id"
                label="직급"
                :disabled="isDetailMode"
                :error="!userDetail.positionId && showErrors"
                required
                v-if="positionOptions.length > 0"
              />
              <span v-if="!userDetail.positionId && showErrors" class="error-text">직급을 선택해주세요.</span>
            </v-col>

            <!-- 이메일 -->
            <v-col cols="12" md="6">
              <v-text-field 
                v-model="userDetail.email" 
                label="이메일" 
                :readonly="isDetailMode"
                :error="!userDetail.email && showErrors"
                required
              />
              <span v-if="!userDetail.email && showErrors" class="error-text">이메일을 입력해주세요.</span>
            </v-col>

            <!-- 전화번호 -->
            <v-col cols="12" md="6">
              <v-text-field 
                v-model="userDetail.phone" 
                label="전화번호" 
                :readonly="isDetailMode"
                :error="!userDetail.phone && showErrors"
                required
              />
              <span v-if="!userDetail.phone && showErrors" class="error-text">전화번호를 입력해주세요.</span>
            </v-col>

            <!-- 고용 유형 선택 -->
            <v-col cols="12" md="6">
              <v-select
                v-model="userDetail.hireType"
                :items="hireTypeOptions"
                label="고용 유형"
                :disabled="isDetailMode"
                :error="!userDetail.hireType && showErrors"
                required
              />
              <span v-if="!userDetail.hireType && showErrors" class="error-text">고용 유형을 선택해주세요.</span>
            </v-col>

            <!-- 잔여 휴가 -->
            <v-col cols="12" md="6">
              <v-text-field v-model="userDetail.annualLeave" label="잔여 휴가" :readonly="isDetailMode" />
            </v-col>

            <!-- 상태 선택 -->
            <v-col cols="12" md="6">
              <v-select
                v-model="userDetail.status"
                :items="statusOptions"
                label="상태"
                :disabled="isDetailMode"
              />
            </v-col>

         
            <!-- 프로필 이미지 업로드 -->
            <v-col cols="12">
              <v-file-input
                label="프로필 이미지 업로드"
                v-model="userDetail.profileImage"
                accept="image/*"
                @change="onFileChange"
              />
              <v-img v-if="previewImageSrc" :src="previewImageSrc" max-width="200" />
            </v-col>

            <!-- 저장 버튼 -->
            <v-col cols="12" class="d-flex justify-end">
            <!-- 관리자 코드 버튼 -->

              <v-btn v-list @click="openAdminCodeDialog" v-if="!isDetailMode">세부 정보 조회</v-btn>
              
              <v-btn  v-create
                v-if="!isDetailMode" 
                type="submit" 
                :class="isEditMode ? 'v-edit' : 'v-create'"
              >
                {{ isEditMode ? '수정 완료' : '등록 완료' }}
              </v-btn>
              
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>

    <v-dialog v-model="isAdminDialogOpen" persistent max-width="400px">
      <v-card>
        <v-card-title class="headline">관리자 코드 입력</v-card-title>
        <v-card-text>
          <v-text-field label="관리자 코드" v-model="adminCode" type="password" />
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" v-check @click="checkAdminCode">확인</v-btn>
          <v-btn color="secondary" v-close @click="closeAdminDialog">취소</v-btn>
          
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-card v-if="isAdmin && !isDetailMode" class="mt-5">
      <v-card-title>세부 정보</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="userDetail.password"
              label="비밀번호"
              :error="userDetail.password && userDetail.password.length < 8 && showErrors"
              type="password"
              required
            />
            <span v-if="userDetail.password && userDetail.password.length < 8 && showErrors" class="error-text">비밀번호는 8자리 이상이어야 합니다.</span>
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field v-model="userDetail.address" label="주소" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="userDetail.socialNum" label="주민등록번호" />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  name: "EmployeeForm",
  data() {
    return {
      userDetail: {
        userNum: '',
        name: '',
        gender: '', 
        status: '재직', 
        departmentId: null,
        positionId: null,
        email: '',
        phone: '',
        profileImage: '',
        hireType: '',
        annualLeave: 0,
        password: '',
        address: '',
        socialNum: '',
      },
      genderOptions: ['M', 'W'], 
      statusOptions: ['휴직', '퇴사', '재직', '계약만료'], 
      departmentOptions: [],
      positionOptions: [],
      hireTypeOptions: ['정규직', '계약직', '인턴', '파트타임'],
      previewImageSrc: null,
      isEditMode: false,
      isDetailMode: false,
      isRegisterMode: false,
      dataLoaded: false,
      isAdmin: false,
      isAdminDialogOpen: false,
      adminCode: '',
      correctAdminCode: '12341234',
      showErrors: true,  
    };
  },
  methods: {
    async generateUserNum() {
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10).replace(/-/g, '');

    try {
      const response = await axios.get(`/user/generateUserNum/${formattedDate}`);
      this.userDetail.userNum = response.data.userNum;  
    } catch (error) {
      console.error("사번을 생성하는 중 오류가 발생했습니다:", error);
    }
  },
    setModeBasedOnRoute() {
      const routeName = this.$route.name;
      if (routeName === 'employee-edit') {
        this.isEditMode = true;
        this.isDetailMode = false;
        this.isRegisterMode = false;
      } else if (routeName === 'employee-detail') {
        this.isEditMode = false;
        this.isDetailMode = true;
        this.isRegisterMode = false;
      } else {
        this.isEditMode = false;
        this.isDetailMode = false;
        this.isRegisterMode = true;
      }
    },
    async fetchUserDetail() {
      const userNum = this.$route.params.userNum;
      if (!userNum) return;
      try {
        const response = await axios.get(`/user/list/${userNum}`);
        if (response.data) {
          this.userDetail = {
            ...response.data,
            departmentId: response.data.departmentId || null,
            positionId: response.data.positionId || null,
          };
          this.previewImageSrc = response.data.profileImage || null;
        }
        this.dataLoaded = true;
      } catch (error) {
        console.error("직원 정보를 불러오는 중 오류가 발생했습니다:", error);
      }
    },
    async fetchDepartments() {
      try {
        const response = await axios.get('/department');
        this.departmentOptions = response.data;
      } catch (error) {
        console.error('부서 목록을 불러오는 중 오류가 발생했습니다:', error);
      }
    },
    async fetchPositions() {
      try {
        const response = await axios.get('/positions');
        this.positionOptions = response.data;
      } catch (error) {
        console.error('직급 목록을 불러오는 중 오류가 발생했습니다:', error);
      }
    },
    onFileChange(event) {
    const files = event.target.files || event.dataTransfer.files;
    if (files && files.length > 0) {
      this.userDetail.profileImage = files[0]; 
      this.previewImage();
    } else {
      this.userDetail.profileImage = null;
      this.previewImageSrc = null;
    }
  },
    previewImage() {
      if (this.userDetail.profileImage) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.previewImageSrc = e.target.result;
        };
        reader.readAsDataURL(this.userDetail.profileImage);
      } else {
        this.previewImageSrc = null;
      }
    },
    openAdminCodeDialog() {
      this.isAdminDialogOpen = true;
    },
    closeAdminDialog() {
      this.adminCode = '';
      this.isAdminDialogOpen = false;
    },
    checkAdminCode() {
      if (this.adminCode === this.correctAdminCode) {
        this.isAdmin = true;
        this.isAdminDialogOpen = false;
        this.fetchAdminDetails();
      } else {
        alert('잘못된 관리자 코드입니다.');
      }
    },
    async fetchAdminDetails() {
      try {
        const response = await axios.get(`/user/admin-details/${this.userDetail.userNum}`);
        if (response.data) {
          this.userDetail.password = response.data.password;
          this.userDetail.address = response.data.address;
          this.userDetail.socialNum = response.data.socialNum;
        }
      } catch (error) {
        console.error("관리자 세부 정보를 불러오는 중 오류가 발생했습니다:", error);
      }
    },

    
    async submitForm() {
      this.showErrors = true;

    if (!this.userDetail.userNum || !this.userDetail.name || !this.userDetail.gender || !this.userDetail.departmentId || !this.userDetail.password || this.userDetail.password.length < 8) {
      alert("모든 필드를 올바르게 입력해주세요.");
      return;
}
  try {
    const formData = new FormData();
    formData.append('userNum', this.userDetail.userNum);
    formData.append('name', this.userDetail.name);
    formData.append('email', this.userDetail.email);
    formData.append('address', this.userDetail.address);
    formData.append('phone', this.userDetail.phone);
    
    if (this.userDetail.profileImage) {
      formData.append('profileImage', this.userDetail.profileImage); // 새로운 이미지 파일 전송
    } else if (this.userDetail.profileImageUrl) {
      formData.append('profileImageUrl', this.userDetail.profileImageUrl); // 기존 이미지 URL 전송
    }

    formData.append('hireType', this.userDetail.hireType);
    formData.append('departmentId', this.userDetail.departmentId);
    formData.append('positionId', this.userDetail.positionId);
    formData.append('annualLeave', this.userDetail.annualLeave);
    formData.append('password', this.userDetail.password);
    formData.append('socialNum', this.userDetail.socialNum);
    formData.append('gender', this.userDetail.gender);
    formData.append('status', this.userDetail.status);

    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      }
    };

    if (this.isEditMode) {
      await axios.put(`/user/list/${this.$route.params.userNum}`, formData, config);
      alert("수정 완료");
    } else {
      await this.generateUserNum();
      await axios.post("/user/register", formData, config);
      alert("등록 완료");
    }

    this.$router.push("/employee-management");
  } catch (error) {
    console.error("직원 정보를 저장하는 중 오류가 발생했습니다:", error);
    if (error.response) {
      alert(error.response.data.status_message);
    }
  }
}
,

    goBack() {
      this.$router.push("/employee-management");
    },
  },
  async mounted() {
    this.setModeBasedOnRoute();
    await this.fetchDepartments();
    await this.fetchPositions();
    
    if (this.isRegisterMode) {
      await this.generateUserNum();
    }

    if (this.$route.params.userNum) {
      await this.fetchUserDetail();
    }
}
,
};
</script>

<style scoped>
.v-btn {
  margin-right: 10px;
}

.red--text {
  color: #f44336 !important;
}
</style>