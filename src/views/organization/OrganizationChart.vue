<template>
  <div class="org-chart">
    <!-- 조직도 검색 -->
    <input
      v-model="searchQuery"
      placeholder="조직도 검색"
      class="search-input"
    />

    <!-- 부서 및 사용자 리스트 -->
    <div class="department-list">
      <ul class="scrollable-list">
        <li v-for="department in filteredHierarchy" :key="department.id" class="department-item">
          <div @click="toggleExpand(department)" class="department-name">
            <span class="expand-icon">{{ expandedDepartments.includes(department.id) ? '-' : '+' }}</span>
            {{ department.name }} ({{ department.totalUsersCount }})
          </div>
          <ul v-if="expandedDepartments.includes(department.id)" class="child-list">
            <!-- 하위 부서 및 사용자 -->
            <li v-for="child in department.children" :key="child.id" class="child-item">
              <div @click="toggleExpand(child)" class="child-department">
                <span class="expand-icon">{{ expandedDepartments.includes(child.id) ? '-' : '+' }}</span>
                {{ child.name }} ({{ child.totalUsersCount }})
              </div>
              <ul v-if="expandedDepartments.includes(child.id)" class="user-list">
                <li v-for="user in child.users" :key="user.userNum" class="user-item">
                  {{ user.name }}
                </li>
              </ul>
            </li>
            <!-- 상위 부서의 사용자 -->
            <li v-for="user in department.users" :key="user.userNum" class="user-item">
              {{ user.name }}
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
        this.hierarchy = await this.calculateUserCounts(response.data);
      } catch (error) {
        console.error('부서 계층 정보를 가져오는 중 오류 발생:', error);
      }
    },
    async calculateUserCounts(departments) {
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
      
      for (const dept of departments) {
        await recurse(dept);
      }
      return departments;
    },
    async toggleExpand(department) {
      if (this.expandedDepartments.includes(department.id)) {
        this.expandedDepartments = this.expandedDepartments.filter(id => id !== department.id);
      } else {
        this.expandedDepartments.push(department.id);
      }
    },
  },
  mounted() {
    this.fetchHierarchy();
  }
};
</script>

<style scoped>
.org-chart {
  padding: 10px;
  height: 100%;
  width: 250px;
  font-size: 12px;
  overflow-y: auto; /* 전체 창 스크롤 가능하게 */
}

.search-input {
  margin-bottom: 10px;
  width: 100%;
  padding: 5px;
  border-radius: 5px;
  border: 1px solid #ddd;
}

.department-list {
  /* 내부 스크롤 제거 */
}

.scrollable-list {
  padding: 0;
  margin: 0;
  list-style-type: none;
}

.department-item {
  margin: 10px 0;
  cursor: pointer;
  padding: 8px 10px;
  background-color: #f0f0f0;
  border-radius: 5px;
}

.department-name {
  display: flex;
  align-items: center;
  font-weight: bold;
}

.child-list {
  list-style-type: none;
  padding-left: 15px;
}

.user-list {
  list-style-type: none;
  padding-left: 20px;
}

.user-item {
  font-size: 11px;
  padding: 2px 0;
  color: #666;
}

.expand-icon {
  margin-right: 5px;
  font-weight: bold;
}
</style>
