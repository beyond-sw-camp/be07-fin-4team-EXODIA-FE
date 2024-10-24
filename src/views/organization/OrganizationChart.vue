<template>
  <div class="org-chart">
    <v-text-field
      v-model="searchQuery"
      label="조직도 검색"
      @input="searchHierarchy"
      clearable
      class="search-input"
    ></v-text-field>

    <div class="department-list">
      <ul>
        <li v-for="department in filteredHierarchy" :key="department.id" class="department-item">
          <div @click="toggleExpand(department)" class="department-name">
            <v-icon large class="mr-2">{{ expandedDepartments.includes(department.id) ? 'mdi-chevron-down' : 'mdi-chevron-right' }}</v-icon>
            {{ department.name }} ({{ department.totalUsersCount }})
          </div>
          <!-- 하위 부서 및 직원 리스트를 클릭 시 확장 -->
          <ul v-if="expandedDepartments.includes(department.id)" class="child-list">
            <!-- 자식 부서 리스트 -->
            <li v-for="child in department.children" :key="child.id" class="child-item">
              <div @click="toggleExpand(child)" class="child-department">
                <v-icon large class="mr-2">{{ expandedDepartments.includes(child.id) ? 'mdi-chevron-down' : 'mdi-chevron-right' }}</v-icon>
                {{ child.name }} ({{ child.totalUsersCount }})
              </div>
              <!-- 자식 부서의 소속 직원 목록 -->
              <ul v-if="expandedDepartments.includes(child.id)" class="user-list">
                <li v-for="user in child.users" :key="user.userNum" class="user-item">
                  <v-icon small class="mr-1">mdi-account</v-icon>{{ user.name }} - {{ user.position }}
                </li>
              </ul>
            </li>
            <!-- 상위 부서의 소속 직원 리스트 -->
            <li v-for="user in department.users" :key="user.userNum" class="user-item">
              <v-icon small class="mr-1">mdi-account</v-icon>{{ user.name }} - {{ user.position }}
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      hierarchy: [], // 부서 계층 정보
      searchQuery: '', // 검색 입력값
      expandedDepartments: [], // 확장된 부서 목록
    };
  },
  computed: {
    filteredHierarchy() {
      // 검색 쿼리로 부서 필터링
      if (!this.searchQuery) {
        return this.hierarchy.filter(dept => !dept.parentId); // 상위 부서만 필터링
      }
      const query = this.searchQuery.toLowerCase();
      return this.hierarchy.filter(dept => dept.name.toLowerCase().includes(query));
    }
  },
  methods: {
    async fetchHierarchy() {
      try {
        const response = await axios.get('/department/hierarchy');
        this.hierarchy = this.calculateUserCounts(response.data);
      } catch (error) {
        console.error('부서 계층 정보를 가져오는 중 오류 발생:', error);
      }
    },
    calculateUserCounts(departments) {
      // 부서 사용자 수 계산
      const recurse = async (dept) => {
        const usersResponse = await axios.get(`/department/${dept.id}/users`);
        dept.users = usersResponse.data || [];

        let totalUsers = dept.users.length;
        if (dept.children && dept.children.length > 0) {
          for (const child of dept.children) {
            totalUsers += await recurse(child); // 자식 부서의 사용자 수 합산
          }
        }
        dept.totalUsersCount = totalUsers;
        return totalUsers;
      };
      departments.forEach(async dept => {
        await recurse(dept);
      });
      return departments;
    },
    async toggleExpand(department) {
      // 부서 확장/축소
      if (this.expandedDepartments.includes(department.id)) {
        this.expandedDepartments = this.expandedDepartments.filter(id => id !== department.id);
      } else {
        if (!department.users || department.users.length === 0) {
          const response = await axios.get(`/department/${department.id}/users`);
          department.users = response.data;
        }
        this.expandedDepartments.push(department.id);
      }
    },
    searchHierarchy() {
      // 검색 쿼리 필터링
    }
  },
  mounted() {
    this.fetchHierarchy(); // 컴포넌트가 마운트될 때 부서 계층 정보를 가져옴
  }
};
</script>

<style scoped>
.org-chart {
  padding: 20px;
}

.search-input {
  margin-bottom: 20px;
}

.department-list {
  padding-left: 0;
  list-style-type: none;
}

.department-item {
  margin: 15px 0;
  cursor: pointer;
  padding: 10px 15px;
  background-color: #f5f5f5;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.department-name {
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
  color: #333;
}

.child-list {
  list-style-type: none;
  padding-left: 30px;
  margin: 10px 0;
}

.child-item {
  margin: 5px 0;
  cursor: pointer;
}

.user-list {
  list-style-type: none;
  padding-left: 40px;
  margin: 10px 0;
}

.user-item {
  font-size: 14px;
  display: flex;
  align-items: center;
  color: #666;
}
</style>
