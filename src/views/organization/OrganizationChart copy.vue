<template>
  <div>
    <!-- 왼쪽 조직도 트리 구조 -->
    <div class="organization-tree">
      <input type="text" placeholder="조직도 검색" class="search-box" />
      <ul>
        <li v-for="node in departmentTree" :key="node.id" class="department-node">
          <div class="department-item">
            <input
              type="checkbox"
              v-model="node.checked"
              @change="onSelectDepartment(node)"
              class="styled-checkbox"
            />
            <label @click="toggleNode(node)" class="department-label">
              {{ node.name }} ({{ node.totalUsersCount }})
            </label>
          </div>
          <ul v-show="node.isOpen" class="child-department">
            <li v-for="child in node.children" :key="child.id">
              <div class="department-item">
                <input
                  type="checkbox"
                  v-model="child.checked"
                  @change="onSelectDepartment(child)"
                  class="styled-checkbox"
                />
                <label @click="toggleNode(child)" class="department-label">
                  {{ child.name }} ({{ child.totalUsersCount }})
                </label>
              </div>
              <ul v-show="child.isOpen" class="child-department">
                <li v-for="user in child.users" :key="user.id" class="user-item">
                  <input
                    type="checkbox"
                    v-model="user.checked"
                    @change="onSelectUser(user)"
                    class="styled-checkbox"
                  />
                  <label>{{ user.name }} 사원</label>
                </li>
              </ul>
            </li>
            <li v-for="user in node.users" :key="user.id" class="user-item">
              <input
                type="checkbox"
                v-model="user.checked"
                @change="onSelectUser(user)"
                class="styled-checkbox"
              />
              <label>{{ user.name }} 사원</label>
            </li>
          </ul>
        </li>
      </ul>
    </div>

    <!-- 우측 선택된 사용자 목록 -->
    <div class="selected-user-list">
      <h3>선택된 사용자 목록</h3>
      <table class="custom-table">
        <thead>
          <tr>
            <th>No.</th>
            <th>이름</th>
            <th>휴대전화번호</th>
            <th>직급</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, index) in selectedUsers" :key="user.id">
            <td>{{ index + 1 }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.phone }}</td>
            <td>{{ user.positionName }}</td>
          </tr>
        </tbody>
      </table>
      <div class="summary">총 {{ selectedUsers.length }}명</div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      departmentTree: [], // 부서 계층 트리
      selectedUsers: [],  // 선택된 사용자 목록
    };
  },
  mounted() {
    this.fetchDepartments(); // 부서 트리 가져오기
  },
  methods: {
    // 부서 계층 및 사용자 정보 가져오기
    async fetchDepartments() {
      try {
        const response = await axios.get('/department/hierarchy');
        if (response.data && Array.isArray(response.data)) {
          this.departmentTree = response.data.map(dept => this.calculateTotalUsers(dept));
        } else {
          console.error("Invalid department hierarchy data:", response.data);
        }
      } catch (error) {
        console.error("Failed to fetch departments:", error);
      }
    },

    // 부서와 하위 부서의 사용자 수 계산
    calculateTotalUsers(department) {
      let totalUsers = department.users ? department.users.length : 0;
      if (department.children && department.children.length > 0) {
        department.children.forEach(child => {
          totalUsers += this.calculateTotalUsers(child).totalUsersCount;
        });
      }
      department.totalUsersCount = totalUsers; // 총 사용자 수 저장
      return department;
    },

    // 노드 토글 (부서 열고 닫기)
    toggleNode(node) {
      node.isOpen = !node.isOpen;
      if (node.isOpen) {
        this.fetchUsers(node.id, node); // 부서 사용자 목록 가져오기
      }
    },

    // 부서 사용자 가져오기
    async fetchUsers(departmentId, node) {
      try {
        const response = await axios.get(`/department/${departmentId}/users`);
        if (response.data && Array.isArray(response.data)) {
          node.users = response.data.map(user => ({
            ...user,
            checked: false,
          }));
          node.totalUsersCount = node.users.length;
        } else {
          console.error("Invalid user data:", response.data);
        }
      } catch (error) {
        console.error(`Failed to fetch users for department ${departmentId}:`, error);
      }
    },

    // 부서 선택 시 하위 부서와 사용자 처리
    onSelectDepartment(department) {
      const isChecked = department.checked;
      this.toggleChildDepartmentCheck(department, isChecked);

      if (isChecked) {
        this.addUsersFromDepartment(department);
      } else {
        this.removeUsersFromDepartment(department);
      }
    },

    // 하위 부서와 사용자의 체크 상태 동기화
    toggleChildDepartmentCheck(department, isChecked) {
      if (department.children) {
        department.children.forEach(child => {
          child.checked = isChecked;
          this.toggleChildDepartmentCheck(child, isChecked);
        });
      }
      if (department.users) {
        department.users.forEach(user => {
          user.checked = isChecked;
          if (isChecked) {
            this.addSelectedUser(user);
          } else {
            this.removeSelectedUser(user);
          }
        });
      }
    },

    // 개별 사용자 선택
    onSelectUser(user) {
      user.checked = !user.checked;
      if (user.checked) {
        this.addSelectedUser(user);
      } else {
        this.removeSelectedUser(user);
      }
    },

    // 선택된 사용자를 추가
    addSelectedUser(user) {
      if (!this.selectedUsers.some(u => u.id === user.id)) {
        this.selectedUsers.push(user);
      }
    },

    // 선택된 사용자를 제거
    removeSelectedUser(user) {
      this.selectedUsers = this.selectedUsers.filter(u => u.id !== user.id);
    },

    // 부서에서 모든 사용자 추가
    addUsersFromDepartment(department) {
      department.users.forEach(user => {
        user.checked = true;
        this.addSelectedUser(user);
      });
      department.children.forEach(child => {
        this.addUsersFromDepartment(child);
      });
    },

    // 부서에서 모든 사용자 제거
    removeUsersFromDepartment(department) {
      department.users.forEach(user => {
        user.checked = false;
        this.removeSelectedUser(user);
      });
      department.children.forEach(child => {
        this.removeUsersFromDepartment(child);
      });
    },
  }
};
</script>


<style scoped>
body {
  font-family: Arial, sans-serif;
}

.organization-tree {
  float: left;
  width: 35%;
  padding-right: 20px;
  background-color: #f9f9f9;
  border-right: 1px solid #ddd;
  height: 600px;
  overflow-y: auto;
}

.selected-user-list {
  float: right;
  width: 60%;
  padding-left: 20px;
}

.search-box {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.department-node,
.user-item {
  padding: 5px;
  cursor: pointer;
  display: block;
}

.child-department {
  padding-left: 20px;
  list-style-type: none;
}

.styled-checkbox {
  appearance: none;
  background-color: #fff;
  border: 1px solid #ddd;
  padding: 8px;
  border-radius: 4px;
  display: inline-block;
  position: relative;
}

.styled-checkbox:checked {
  background-color: #7A5656;
}

.department-label {
  font-weight: bold;
  color: #7A5656;
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.custom-table th,
.custom-table td {
  border: 1px solid #ddd;
  padding: 8px;
}

.custom-table th {
  background-color: #7A5656;
  color: white;
}

.custom-table td {
  text-align: center;
}

.summary {
  text-align: right;
  font-weight: bold;
  margin-top: 10px;
  color: #7A5656;
}
</style>
