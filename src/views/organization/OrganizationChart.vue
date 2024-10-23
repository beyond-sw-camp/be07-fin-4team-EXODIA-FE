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
              <td>{{ user.positionName  }}</td>
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
    async fetchDepartments() {
      try {
        // 부서 계층 데이터 가져오기
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
    calculateTotalUsers(department) {
      // totalUsersCount가 users 배열의 길이를 기반으로 계산
      department.totalUsersCount = department.users ? department.users.length : 0;

      // 자식 부서에 대해서도 총 사용자 수를 합산
      if (department.children && department.children.length > 0) {
        department.children.forEach(child => {
          department.totalUsersCount += this.calculateTotalUsers(child).totalUsersCount;
        });
      }
      return department;
    },
    toggleNode(node) {
      node.isOpen = !node.isOpen; // 노드 열고 닫기
      if (node.isOpen) {
        this.fetchUsers(node.id, node); // 해당 부서 사용자 목록 가져오기
      }
    },
    async fetchUsers(departmentId, node) {
      try {
        const response = await axios.get(`/department/${departmentId}/users`);
        if (response.data && Array.isArray(response.data)) {
          node.users = response.data.map(user => ({
            ...user,
            checked: false,
          }));
        } else {
          console.error("Invalid user data:", response.data);
        }
      } catch (error) {
        console.error(`Failed to fetch users for department ${departmentId}:`, error);
      }
    },
    onSelectDepartment(department) {
      if (department.checked) {
        this.addUsersFromDepartment(department);
      } else {
        this.removeUsersFromDepartment(department.id);
      }
    },
    addUsersFromDepartment(department) {
      department.users.forEach(user => {
        user.checked = true;
        this.selectedUsers.push(user);
      });
      department.children.forEach(child => {
        this.addUsersFromDepartment(child);
      });
    },
    removeUsersFromDepartment(departmentId) {
      this.selectedUsers = this.selectedUsers.filter(
        user => user.departmentId !== departmentId
      );
    },
    onSelectUser(user) {
      if (!user.checked) {
        this.selectedUsers = this.selectedUsers.filter(u => u.id !== user.id);
      } else {
        this.selectedUsers.push(user);
      }
    },
  },
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

.department-node, .user-item {
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

.custom-table th, .custom-table td {
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
